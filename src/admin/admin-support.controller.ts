import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('admin/support')
export class AdminSupportController {
    constructor(private readonly prisma: PrismaService) { }

    @Get('stats')
    @UseGuards(JwtAuthGuard)
    async getStats() {
        const [openTickets, pendingReviews] = await Promise.all([
            this.prisma.supportTicket.count({ where: { status: 'OPEN' } }),
            this.prisma.branchReview.count({ where: { adminReply: null } })
        ]);

        return {
            openTickets,
            pendingReviews
        };
    }

    @Get('tickets')
    @UseGuards(JwtAuthGuard)
    async getTickets() {
        return this.prisma.supportTicket.findMany({
            include: {
                user: { select: { firstName: true, lastName: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    @Get('reviews')
    @UseGuards(JwtAuthGuard)
    async getReviews() {
        // Combining branch reviews and potentially product reviews in the future
        return this.prisma.branchReview.findMany({
            include: {
                user: { select: { firstName: true, lastName: true } },
                branch: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' }
        });
    }

    @Post('reviews/:id/reply')
    @UseGuards(JwtAuthGuard)
    async replyToReview(@Param('id') id: string, @Body('reply') reply: string) {
        return this.prisma.branchReview.update({
            where: { id },
            data: {
                adminReply: reply,
                adminReplyAt: new Date()
            }
        });
    }

    @Get('activity')
    @UseGuards(JwtAuthGuard)
    async getActivity() {
        // Simplified latest activity feed
        const [recentReviews, recentTickets] = await Promise.all([
            this.prisma.branchReview.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { firstName: true, lastName: true } } }
            }),
            this.prisma.supportTicket.findMany({
                take: 5,
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { firstName: true, lastName: true } } }
            })
        ]);

        const activities = [
            ...recentReviews.map(r => ({
                user: `${r.user.firstName} ${r.user.lastName}`,
                action: 'posted a new review',
                target: `Branch Review`,
                time: r.createdAt,
                type: 'review'
            })),
            ...recentTickets.map(t => ({
                user: `${t.user?.firstName || 'User'} ${t.user?.lastName || ''}`,
                action: 'created a new ticket',
                target: t.subject,
                time: t.createdAt,
                type: 'ticket'
            }))
        ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 10);

        return activities;
    }
}
