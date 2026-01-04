import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './category.dto';

@Injectable()
export class CategoryService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.category.findMany({
            where: { isActive: true },
            include: {
                _count: {
                    select: { products: true }
                }
            },
            orderBy: { name: 'asc' }
        });
    }

    async findOne(id: string) {
        const category = await this.prisma.category.findUnique({
            where: { id },
            include: {
                products: {
                    take: 10,
                    include: { media: true }
                }
            }
        });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        return category;
    }

    async create(dto: CreateCategoryDto, adminUserId?: string) {
        const category = await this.prisma.category.create({
            data: {
                name: dto.name,
                slug: dto.slug,
                description: dto.description,
                imageUrl: dto.imageUrl,
                parentId: dto.parentId,
            }
        });

        if (adminUserId) {
            await this.prisma.adminActivityLog.create({
                data: {
                    adminUserId,
                    action: 'CREATE',
                    objectType: 'CATEGORY',
                    objectId: category.id,
                    details: { name: category.name }
                }
            });
        }

        return category;
    }

    async update(id: string, dto: UpdateCategoryDto, adminUserId?: string) {
        const category = await this.prisma.category.findUnique({ where: { id } });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        const updated = await this.prisma.category.update({
            where: { id },
            data: dto
        });

        if (adminUserId) {
            await this.prisma.adminActivityLog.create({
                data: {
                    adminUserId,
                    action: 'UPDATE',
                    objectType: 'CATEGORY',
                    objectId: id,
                    details: { name: updated.name, changes: Object.keys(dto) }
                }
            });
        }

        return updated;
    }

    async delete(id: string, adminUserId?: string) {
        const category = await this.prisma.category.findUnique({ where: { id } });

        if (!category) {
            throw new NotFoundException('Category not found');
        }

        // Soft delete by setting isActive to false
        const deleted = await this.prisma.category.update({
            where: { id },
            data: { isActive: false }
        });

        if (adminUserId) {
            await this.prisma.adminActivityLog.create({
                data: {
                    adminUserId,
                    action: 'DEACTIVATE',
                    objectType: 'CATEGORY',
                    objectId: id,
                    details: { name: deleted.name }
                }
            });
        }

        return deleted;
    }
}
