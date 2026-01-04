import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchReviewDto, AdminReplyDto } from './branch.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('branches')
export class BranchController {
    constructor(private readonly branchService: BranchService) { }

    // Public - List all branches
    @Get()
    findAll() {
        return this.branchService.findAll();
    }

    // Public - Get single branch by slug
    @Get(':slug')
    findOne(@Param('slug') slug: string) {
        return this.branchService.findBySlug(slug);
    }

    // Public - Get reviews for a branch
    @Get(':slug/reviews')
    getReviews(@Param('slug') slug: string) {
        return this.branchService.getReviewsForBranch(slug);
    }

    // Protected - Create review (authenticated users only)
    @Post(':slug/reviews')
    @UseGuards(JwtAuthGuard)
    createReview(
        @Param('slug') slug: string,
        @Body() dto: CreateBranchReviewDto,
        @Request() req: any
    ) {
        return this.branchService.createReview(slug, req.user.id, dto);
    }

    // Protected - Admin reply (will check for ADMIN role in admin dashboard later)
    @Post('reviews/:reviewId/reply')
    @UseGuards(JwtAuthGuard)
    addAdminReply(
        @Param('reviewId') reviewId: string,
        @Body() dto: AdminReplyDto
    ) {
        return this.branchService.addAdminReply(reviewId, dto);
    }
}
