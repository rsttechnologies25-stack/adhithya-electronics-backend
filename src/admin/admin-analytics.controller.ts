import { Controller, Get, UseGuards, Query, Res } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import * as express from 'express';

@Controller('admin/analytics')
export class AdminAnalyticsController {
    constructor(private readonly prisma: PrismaService) { }

    @Get('summary')
    @UseGuards(JwtAuthGuard)
    async getSummary(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        // Current Period
        const dateFilter = this.getDateFilter(startDate, endDate);

        // Previous Period (for calculating change)
        const prevDateFilter = this.getPreviousDateFilter(startDate, endDate);

        const [
            currMetrics,
            prevMetrics,
            totalUsers
        ] = await Promise.all([
            this.getMetricsForPeriod(dateFilter),
            this.getMetricsForPeriod(prevDateFilter),
            this.prisma.user.count({ where: { role: 'CUSTOMER' } })
        ]);

        const calcChange = (curr: number, prev: number) => {
            if (prev <= 0) return curr > 0 ? 100 : 0;
            return parseFloat(((curr - prev) / prev * 100).toFixed(1));
        };

        return {
            totalRevenue: currMetrics.revenue,
            revenueChange: calcChange(currMetrics.revenue, prevMetrics.revenue),
            totalOrders: currMetrics.orders,
            ordersChange: calcChange(currMetrics.orders, prevMetrics.orders),
            avgOrderValue: currMetrics.orders > 0 ? currMetrics.revenue / currMetrics.orders : 0,
            aovChange: calcChange(
                currMetrics.orders > 0 ? currMetrics.revenue / currMetrics.orders : 0,
                prevMetrics.orders > 0 ? prevMetrics.revenue / prevMetrics.orders : 0
            ),
            conversionRate: totalUsers > 0 ? (currMetrics.orders / totalUsers) * 100 : 0,
            conversionChange: calcChange(
                totalUsers > 0 ? (currMetrics.orders / totalUsers) * 100 : 0,
                totalUsers > 0 ? (prevMetrics.orders / totalUsers) * 100 : 0
            ),
            totalUsers
        };
    }

    private async getMetricsForPeriod(filter: any) {
        const aggr = await this.prisma.order.aggregate({
            where: filter,
            _sum: { total: true },
            _count: true
        });
        return {
            revenue: aggr._sum.total || 0,
            orders: aggr._count || 0
        };
    }

    @Get('trends')
    @UseGuards(JwtAuthGuard)
    async getTrends(
        @Query('period') period: string = 'daily',
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        let filter = this.getDateFilter(startDate, endDate);

        // Adjust default range based on period if no dates provided
        if (!startDate && !endDate) {
            const start = new Date();
            start.setHours(0, 0, 0, 0);
            if (period === 'weekly') {
                start.setDate(start.getDate() - (7 * 8)); // Last 8 weeks
            } else if (period === 'monthly') {
                start.setMonth(start.getMonth() - 6); // Last 6 months
            } else {
                start.setDate(start.getDate() - 7); // Last 7 days
            }
            filter = { createdAt: { gte: start } };
        }

        const orders = await this.prisma.order.findMany({
            where: filter,
            select: { total: true, createdAt: true },
            orderBy: { createdAt: 'asc' }
        });

        const trendMap = new Map();
        orders.forEach(order => {
            let key = '';
            const d = new Date(order.createdAt);

            if (period === 'weekly') {
                // Group by start of week (Sunday)
                const startOfWeek = new Date(d);
                startOfWeek.setDate(d.getDate() - d.getDay());
                key = startOfWeek.toISOString().split('T')[0];
            } else if (period === 'monthly') {
                // Group by year-month
                key = d.toISOString().substring(0, 7);
            } else {
                // Daily (default)
                key = d.toISOString().split('T')[0];
            }

            if (!trendMap.has(key)) {
                trendMap.set(key, { date: key, revenue: 0, orders: 0 });
            }
            const data = trendMap.get(key);
            data.revenue += order.total;
            data.orders += 1;
        });

        return Array.from(trendMap.values()).sort((a: any, b: any) => a.date.localeCompare(b.date));
    }

    @Get('top-selling')
    @UseGuards(JwtAuthGuard)
    async getTopSelling(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        const dateFilter = this.getDateFilter(startDate, endDate);
        const topProducts = await this.prisma.orderItem.groupBy({
            by: ['variantId'],
            where: { order: dateFilter },
            _sum: { quantity: true },
            orderBy: { _sum: { quantity: 'desc' } },
            take: 5
        });

        return Promise.all(topProducts.map(async (p) => {
            const variant = await this.prisma.productVariant.findUnique({
                where: { id: p.variantId },
                include: { product: { select: { name: true } } }
            });
            return {
                name: variant?.product.name || 'Unknown',
                value: p._sum.quantity || 0
            };
        }));
    }

    @Get('top-categories')
    @UseGuards(JwtAuthGuard)
    async getTopCategories(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        const dateFilter = this.getDateFilter(startDate, endDate);
        const categories = await this.prisma.category.findMany({
            where: { isActive: true },
            include: {
                products: {
                    include: {
                        variants: {
                            include: {
                                orderItems: {
                                    where: { order: dateFilter },
                                    select: { totalPrice: true }
                                }
                            }
                        }
                    }
                }
            }
        });

        return categories.map(cat => {
            let totalRevenue = 0;
            cat.products.forEach(p => p.variants.forEach(v => v.orderItems.forEach(oi => totalRevenue += oi.totalPrice)));
            return { name: cat.name, value: totalRevenue };
        }).sort((a, b) => b.value - a.value).slice(0, 3);
    }

    @Get('recent-events')
    @UseGuards(JwtAuthGuard)
    async getRecentEvents(
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string
    ) {
        const dateFilter = this.getDateFilter(startDate, endDate);
        return this.prisma.order.findMany({
            where: dateFilter,
            take: 10,
            orderBy: { createdAt: 'desc' },
            include: { user: { select: { firstName: true, lastName: true } } }
        });
    }

    @Get('customer-segments')
    @UseGuards(JwtAuthGuard)
    async getCustomerSegments() {
        const [totalUsers, repeatBuyers] = await Promise.all([
            this.prisma.user.count({ where: { role: 'CUSTOMER' } }),
            this.prisma.user.count({ where: { role: 'CUSTOMER', orders: { some: {} } } })
        ]);
        return [
            { label: "New Customers", value: totalUsers - repeatBuyers, color: "#e2e8f0" },
            { label: "Repeat Buyers", value: repeatBuyers, color: "#dc2626" },
            { label: "High Value", value: Math.floor(repeatBuyers * 0.2), color: "#1e293b" }
        ];
    }

    @Get('export')
    @UseGuards(JwtAuthGuard)
    async exportAnalytics(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
        @Res() res: express.Response
    ) {
        const dateFilter = this.getDateFilter(startDate, endDate);
        const orders = await this.prisma.order.findMany({
            where: dateFilter,
            include: { user: { select: { firstName: true, lastName: true, email: true } } },
            orderBy: { createdAt: 'asc' }
        });

        let csv = 'Order ID,Customer,Email,Total Amount,Status,Date\n';
        orders.forEach(order => {
            const customer = `${order.user?.firstName || ''} ${order.user?.lastName || ''}`.replace(/,/g, '');
            csv += `${order.orderNumber},${customer},${order.user?.email || ''},${order.total},${order.status},${order.createdAt.toISOString()}\n`;
        });

        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="analytics_report_${startDate}_to_${endDate}.csv"`);
        return res.status(200).send(csv);
    }

    private getDateFilter(startDate?: string, endDate?: string) {
        if (!startDate && !endDate) return {};
        const filter: any = { createdAt: {} };

        if (startDate) {
            const s = new Date(startDate);
            if (!isNaN(s.getTime())) {
                s.setHours(0, 0, 0, 0); // Start of day
                filter.createdAt.gte = s;
            }
        }

        if (endDate) {
            const e = new Date(endDate);
            if (!isNaN(e.getTime())) {
                e.setHours(23, 59, 59, 999); // End of day
                filter.createdAt.lte = e;
            }
        }

        // Avoid empty createdAt object if both dates were invalid
        if (Object.keys(filter.createdAt).length === 0) delete filter.createdAt;

        return filter;
    }

    private getPreviousDateFilter(startDate?: string, endDate?: string) {
        // If no dates, default to comparing last 7 days vs previous 7 days
        let startStr = startDate;
        let endStr = endDate;

        if (!startStr || !endStr) {
            const end = new Date();
            const start = new Date();
            start.setDate(end.getDate() - 7);
            startStr = start.toISOString();
            endStr = end.toISOString();
        }

        const start = new Date(startStr);
        const end = new Date(endStr);

        if (isNaN(start.getTime()) || isNaN(end.getTime())) {
            return { createdAt: { gte: new Date(0), lte: new Date(0) } };
        }

        const diff = end.getTime() - start.getTime();
        const prevEnd = new Date(start.getTime() - 1);
        const prevStart = new Date(prevEnd.getTime() - diff);

        return {
            createdAt: {
                gte: prevStart,
                lte: prevEnd
            }
        };
    }
}
