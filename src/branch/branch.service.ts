import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBranchReviewDto, AdminReplyDto } from './branch.dto';

@Injectable()
export class BranchService {
    constructor(private prisma: PrismaService) { }

    async findAll() {
        const branches = await this.prisma.branch.findMany({
            where: { isActive: true },
            include: {
                reviews: {
                    include: {
                        user: {
                            select: { firstName: true, lastName: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            },
            orderBy: { name: 'asc' }
        });

        // Add average rating calculation
        return branches.map(branch => ({
            ...branch,
            avgRating: branch.reviews.length > 0
                ? branch.reviews.reduce((sum, r) => sum + r.rating, 0) / branch.reviews.length
                : 0,
            reviewCount: branch.reviews.length
        }));
    }

    async findBySlug(slug: string) {
        const branch = await this.prisma.branch.findUnique({
            where: { slug },
            include: {
                reviews: {
                    include: {
                        user: {
                            select: { firstName: true, lastName: true }
                        }
                    },
                    orderBy: { createdAt: 'desc' }
                }
            }
        });

        if (!branch) {
            throw new NotFoundException(`Branch with slug "${slug}" not found`);
        }

        return {
            ...branch,
            avgRating: branch.reviews.length > 0
                ? branch.reviews.reduce((sum, r) => sum + r.rating, 0) / branch.reviews.length
                : 0,
            reviewCount: branch.reviews.length
        };
    }

    async createReview(branchSlug: string, userId: string, dto: CreateBranchReviewDto) {
        const branch = await this.prisma.branch.findUnique({
            where: { slug: branchSlug }
        });

        if (!branch) {
            throw new NotFoundException(`Branch with slug "${branchSlug}" not found`);
        }

        // Check if user already reviewed this branch
        const existingReview = await this.prisma.branchReview.findFirst({
            where: {
                branchId: branch.id,
                userId: userId
            }
        });

        if (existingReview) {
            // Update existing review
            return this.prisma.branchReview.update({
                where: { id: existingReview.id },
                data: {
                    rating: dto.rating,
                    title: dto.title,
                    body: dto.body
                },
                include: {
                    user: {
                        select: { firstName: true, lastName: true }
                    }
                }
            });
        }

        // Create new review
        return this.prisma.branchReview.create({
            data: {
                branchId: branch.id,
                userId: userId,
                rating: dto.rating,
                title: dto.title,
                body: dto.body
            },
            include: {
                user: {
                    select: { firstName: true, lastName: true }
                }
            }
        });
    }

    async addAdminReply(reviewId: string, dto: AdminReplyDto) {
        const review = await this.prisma.branchReview.findUnique({
            where: { id: reviewId }
        });

        if (!review) {
            throw new NotFoundException(`Review not found`);
        }

        return this.prisma.branchReview.update({
            where: { id: reviewId },
            data: {
                adminReply: dto.reply,
                adminReplyAt: new Date()
            }
        });
    }

    async getReviewsForBranch(branchSlug: string) {
        const branch = await this.prisma.branch.findUnique({
            where: { slug: branchSlug }
        });

        if (!branch) {
            throw new NotFoundException(`Branch with slug "${branchSlug}" not found`);
        }

        return this.prisma.branchReview.findMany({
            where: { branchId: branch.id },
            include: {
                user: {
                    select: { firstName: true, lastName: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        });
    }
}
