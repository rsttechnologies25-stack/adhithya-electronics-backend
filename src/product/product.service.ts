import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProductFilterDto, CreateProductDto, SortOrder } from './product.dto';

@Injectable()
export class ProductService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(filter: ProductFilterDto) {
        const { query, categories, brands, minPrice, maxPrice, sort, page = 1, limit = 12 } = filter;
        const skip = (page - 1) * limit;

        const where: any = {
            status: 'published',
        };

        if (query) {
            where.OR = [
                { name: { contains: query } },
                { shortDescription: { contains: query } },
            ];
        }

        if (categories && categories.length > 0) {
            where.category = {
                name: { in: categories },
            };
        }

        if (brands && brands.length > 0) {
            where.brand = { in: brands };
        }

        if (minPrice !== undefined || maxPrice !== undefined) {
            where.basePrice = {};
            if (minPrice !== undefined) where.basePrice.gte = minPrice;
            if (maxPrice !== undefined) where.basePrice.lte = maxPrice;
        }

        let orderBy: any = { createdAt: 'desc' };
        if (sort === SortOrder.PRICE_LOW_HIGH) orderBy = { basePrice: 'asc' };
        if (sort === SortOrder.PRICE_HIGH_LOW) orderBy = { basePrice: 'desc' };
        if (sort === SortOrder.NEWEST) orderBy = { createdAt: 'desc' };

        const [items, total] = await Promise.all([
            this.prisma.product.findMany({
                where,
                orderBy,
                skip,
                take: limit,
                include: {
                    category: true,
                    media: true,
                    variants: {
                        include: {
                            inventory: true
                        }
                    },
                    reviews: {
                        select: { rating: true },
                    },
                },
            }),
            this.prisma.product.count({ where }),
        ]);

        // Format ratings
        const products = items.map((product) => {
            const ratings = product.reviews.map((r) => r.rating);
            const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;
            return {
                ...product,
                avgRating,
                reviewCount: ratings.length,
            };
        });

        return {
            items: products,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(slugOrId: string) {
        const product = await this.prisma.product.findFirst({
            where: {
                OR: [{ id: slugOrId }, { slug: slugOrId }],
                status: 'published',
            },
            include: {
                category: true,
                media: true,
                specs: true,
                variants: {
                    include: {
                        inventory: true
                    }
                },
                reviews: {
                    include: { user: { select: { firstName: true, lastName: true } } },
                },
            },
        });

        if (!product) throw new NotFoundException('Product not found');

        const ratings = product.reviews.map((r) => r.rating);
        const avgRating = ratings.length > 0 ? ratings.reduce((a, b) => a + b, 0) / ratings.length : 0;

        return {
            ...product,
            avgRating,
            reviewCount: ratings.length,
        };
    }

    async getFilters() {
        const [categories, brands] = await Promise.all([
            this.prisma.category.findMany({ select: { name: true, slug: true } }),
            this.prisma.product.findMany({
                where: { status: 'published', brand: { not: null } },
                select: { brand: true },
                distinct: ['brand'],
            }),
        ]);

        return {
            categories,
            brands: brands.map((b) => b.brand).filter(Boolean),
        };
    }

    async create(dto: CreateProductDto, adminUserId?: string) {
        try {
            const { media, specs, ...productData } = dto;

            // Check if SKU already exists
            const existingSku = await this.prisma.product.findUnique({
                where: { sku: dto.sku }
            });
            if (existingSku) {
                throw new BadRequestException(`Product with SKU ${dto.sku} already exists`);
            }

            const product = await this.prisma.product.create({
                data: {
                    ...productData,
                    media: media ? {
                        create: media
                    } : undefined,
                    specs: specs ? {
                        create: specs
                    } : undefined,
                    // Create a default variant for every product
                    variants: {
                        create: {
                            sku: `${dto.sku}-DEF`,
                            title: 'Default',
                            price: dto.basePrice,
                            inventory: {
                                create: {
                                    quantity: 10, // Default initial stock
                                    lowStockThreshold: 3
                                }
                            }
                        }
                    }
                },
                include: {
                    media: true,
                    category: true,
                    variants: {
                        include: {
                            inventory: true
                        }
                    }
                }
            });

            if (adminUserId) {
                await this.prisma.adminActivityLog.create({
                    data: {
                        adminUserId,
                        action: 'CREATE',
                        objectType: 'PRODUCT',
                        objectId: product.id,
                        details: { name: product.name, sku: product.sku }
                    }
                });
            }

            return product;
        } catch (error) {
            console.error('Error creating product:', error);
            throw error;
        }
    }

    async update(id: string, dto: Partial<CreateProductDto>, adminUserId?: string) {
        try {
            const product = await this.prisma.product.findUnique({
                where: { id },
                include: { media: true, specs: true }
            });
            if (!product) throw new NotFoundException('Product not found');

            const { media, specs, ...productData } = dto;

            // Use a transaction to ensure atomic updates
            return await this.prisma.$transaction(async (tx) => {
                // 1. Update basic product data
                await tx.product.update({
                    where: { id },
                    data: productData,
                });

                // 2. Update Media if provided
                if (media !== undefined) {
                    // Remove old media
                    await tx.productMedia.deleteMany({ where: { productId: id } });
                    // Add new media
                    if (media.length > 0) {
                        for (const item of media) {
                            await tx.productMedia.create({
                                data: { ...item, productId: id }
                            });
                        }
                    }
                }

                // 3. Update Specs if provided
                if (specs !== undefined) {
                    // Remove old specs
                    await tx.productSpecification.deleteMany({ where: { productId: id } });
                    // Add new specs
                    if (specs.length > 0) {
                        for (const item of specs) {
                            await tx.productSpecification.create({
                                data: { ...item, productId: id }
                            });
                        }
                    }
                }

                const updated = await tx.product.findUnique({
                    where: { id },
                    include: { media: true, specs: true, variants: true }
                });

                if (adminUserId && updated) {
                    await tx.adminActivityLog.create({
                        data: {
                            adminUserId,
                            action: 'UPDATE',
                            objectType: 'PRODUCT',
                            objectId: id,
                            details: { name: updated.name, changes: Object.keys(dto) }
                        }
                    });
                }

                return updated;
            });
        } catch (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    }

    async delete(id: string, adminUserId?: string) {
        const product = await this.prisma.product.findUnique({ where: { id } });
        if (!product) throw new NotFoundException('Product not found');

        // soft delete by setting status to 'archived'
        const deleted = await this.prisma.product.update({
            where: { id },
            data: { status: 'archived' },
        });

        if (adminUserId) {
            await this.prisma.adminActivityLog.create({
                data: {
                    adminUserId,
                    action: 'ARCHIVE',
                    objectType: 'PRODUCT',
                    objectId: id,
                    details: { name: deleted.name }
                }
            });
        }

        return deleted;
    }
}
