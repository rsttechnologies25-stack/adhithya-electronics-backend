import { Controller, Get, UseGuards } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('admin/stats')
export class AdminStatsController {
    constructor(private readonly prisma: PrismaService) { }

    @Get('overview')
    @UseGuards(JwtAuthGuard)
    async getOverview() {
        const [
            productCount,
            activeProducts,
            draftProducts,
            categoryCount,
            userCount,
            testimonialCount,
            partnerCount,
            userCountMonth,
            activeCustomersCount
        ] = await Promise.all([
            this.prisma.product.count(),
            this.prisma.product.count({ where: { status: 'published' } }),
            this.prisma.product.count({ where: { status: 'draft' } }),
            this.prisma.category.count({ where: { isActive: true } }),
            this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
            this.prisma.testimonial.count({ where: { isActive: true } }),
            this.partnerCount(),
            this.prisma.user.count({
                where: {
                    role: 'CUSTOMER',
                    createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
                }
            }),
            this.prisma.user.count({
                where: {
                    role: 'CUSTOMER',
                    orders: { some: {} }
                }
            })
        ]);

        const [
            orders,
            totalRevenueRes
        ] = await Promise.all([
            this.prisma.order.findMany({ select: { total: true } }),
            this.prisma.order.aggregate({ _sum: { total: true } })
        ]);

        const totalOrders = orders.length;
        const totalRevenue = totalRevenueRes._sum.total || 0;
        const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

        const customersWithOrders = await this.prisma.user.findMany({
            where: { role: 'CUSTOMER', orders: { some: {} } },
            select: {
                _count: {
                    select: { orders: true }
                }
            }
        });

        const customersWithMultipleOrders = customersWithOrders.filter(c => c._count.orders > 1).length;
        const totalCustomersWithOrders = customersWithOrders.length;

        const retentionRate = userCount > 0 ? (customersWithMultipleOrders / userCount) * 100 : 0;

        // Segmentation counts
        const [vipCount, newSignupsCount] = await Promise.all([
            this.prisma.user.count({ where: { role: 'CUSTOMER', orders: { some: { total: { gte: 50000 } } } } }), // Example VIP criteria
            this.prisma.user.count({
                where: {
                    role: 'CUSTOMER',
                    createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
                }
            })
        ]);

        return {
            products: productCount,
            activeProducts,
            draftProducts,
            categories: categoryCount,
            users: userCount,
            testimonials: testimonialCount,
            partners: partnerCount,
            newCustomersMonth: userCountMonth,
            activeCustomers: activeCustomersCount,
            avgOrderValue,
            retentionRate,
            segmentation: {
                vip: vipCount,
                returning: customersWithMultipleOrders,
                newSignups: newSignupsCount
            },
            salesToday: 0,
            ordersToday: 0,
            revenueMonth: 0,
        };
    }

    @Get('recent-activity')
    @UseGuards(JwtAuthGuard)
    async getRecentActivity() {
        return this.prisma.adminActivityLog.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: {
                adminUser: {
                    select: { firstName: true, lastName: true, email: true }
                }
            }
        });
    }

    private async partnerCount() {
        try {
            // @ts-ignore - Prisma might not have generated the partner model yet in the IDE's view
            return await this.prisma.partner.count({ where: { isActive: true } });
        } catch (e) {
            return 0;
        }
    }
}
