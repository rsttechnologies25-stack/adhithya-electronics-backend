import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { TestimonialService } from './testimonial.service';
import { CreateTestimonialDto, UpdateTestimonialDto } from './testimonial.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('testimonials')
export class TestimonialController {
    constructor(private readonly testimonialService: TestimonialService) { }

    @Get()
    async findAll() {
        return this.testimonialService.findAll();
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() dto: CreateTestimonialDto) {
        return this.testimonialService.create(dto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: string, @Body() dto: UpdateTestimonialDto) {
        return this.testimonialService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async delete(@Param('id') id: string) {
        return this.testimonialService.delete(id);
    }
}
