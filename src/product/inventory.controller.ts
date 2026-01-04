import { Controller, Get, Patch, Body, Param, UseGuards, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('admin/inventory')
@UseGuards(JwtAuthGuard)
export class InventoryController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    async findAll(@Query('search') search?: string) {
        const where: any = {};
        if (search) {
            where.OR = [
                { product: { name: { contains: search } } },
                { sku: { contains: search } },
            ];
        }

        // Only show products that are not archived
        where.product = {
            ...where.product,
            status: 'published'
        };

        const variants = await this.prisma.productVariant.findMany({
            where,
            include: {
                product: {
                    select: { name: true, sku: true }
                },
                inventory: true
            },
            orderBy: {
                product: { name: 'asc' }
            }
        });

        // Map to ensure inventory exists (lazy creation in response for UI)
        return Promise.all(variants.map(async v => {
            if (!v.inventory) {
                v.inventory = await this.prisma.inventory.create({
                    data: {
                        variantId: v.id,
                        quantity: 0,
                        lowStockThreshold: 3
                    }
                });
            }
            return v;
        }));
    }

    @Patch(':variantId')
    async update(@Param('variantId') variantId: string, @Body() dto: { quantity: number, lowStockThreshold?: number }) {
        return this.prisma.inventory.upsert({
            where: { variantId },
            update: {
                quantity: dto.quantity,
                lowStockThreshold: dto.lowStockThreshold ?? undefined,
            },
            create: {
                variantId,
                quantity: dto.quantity,
                lowStockThreshold: dto.lowStockThreshold ?? 3,
            }
        });
    }
}
