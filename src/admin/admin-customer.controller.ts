import { Controller, Get, Param, Delete, UseGuards, Query, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { Role } from '@prisma/client';

@Controller('admin/customers')
@UseGuards(JwtAuthGuard)
export class AdminCustomerController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    async findAll(@Query('search') search?: string) {
        const where: any = {
            role: Role.CUSTOMER
        };

        if (search) {
            where.OR = [
                { firstName: { contains: search } },
                { lastName: { contains: search } },
                { email: { contains: search } },
            ];
        }

        return this.prisma.user.findMany({
            where,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                createdAt: true,
                _count: {
                    select: { orders: true }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.prisma.user.findUnique({
            where: { id, role: Role.CUSTOMER },
            include: {
                addresses: true,
                orders: {
                    take: 5,
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true,
                        orderNumber: true,
                        total: true,
                        status: true,
                        createdAt: true
                    }
                }
            }
        });
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        const customer = await this.prisma.user.findUnique({
            where: { id, role: Role.CUSTOMER },
            include: { _count: { select: { orders: true } } }
        });

        if (!customer) throw new NotFoundException('Customer not found');

        if (customer._count.orders > 0) {
            throw new BadRequestException('Cannot delete customer with existing orders. Consider deactivating instead.');
        }

        // Delete related data first to avoid P2003
        await this.prisma.$transaction([
            this.prisma.address.deleteMany({ where: { userId: id } }),
            this.prisma.cart.deleteMany({ where: { userId: id } }),
            this.prisma.review.deleteMany({ where: { userId: id } }),
            this.prisma.branchReview.deleteMany({ where: { userId: id } }),
            this.prisma.user.delete({ where: { id } })
        ]);

        return { message: 'Customer deleted successfully' };
    }
}
