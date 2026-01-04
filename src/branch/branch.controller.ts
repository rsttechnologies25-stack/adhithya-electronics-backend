import { Controller, Get, Post, Body, Param, UseGuards, Request, Patch, Delete } from '@nestjs/common';
import { BranchService } from './branch.service';
import { CreateBranchReviewDto, AdminReplyDto, CreateBranchDto, UpdateBranchDto } from './branch.dto';
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

    // Protected - Admin reply
    @Post('reviews/:reviewId/reply')
    @UseGuards(JwtAuthGuard)
    addAdminReply(
        @Param('reviewId') reviewId: string,
        @Body() dto: AdminReplyDto
    ) {
        return this.branchService.addAdminReply(reviewId, dto);
    }

    // Admin - Create branch
    @Post()
    @UseGuards(JwtAuthGuard) // Add RoleGuard later to restrict to ADMIN
    create(@Body() dto: CreateBranchDto) {
        return this.branchService.create(dto);
    }

    // Admin - Update branch
    @Patch(':id')
    @UseGuards(JwtAuthGuard)
    update(@Param('id') id: string, @Body() dto: UpdateBranchDto) {
        return this.branchService.update(id, dto);
    }

    // Admin - Delete branch
    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    remove(@Param('id') id: string) {
        return this.branchService.remove(id);
    }
}
