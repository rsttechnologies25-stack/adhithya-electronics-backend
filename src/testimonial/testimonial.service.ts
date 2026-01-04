import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTestimonialDto, UpdateTestimonialDto } from './testimonial.dto';

@Injectable()
export class TestimonialService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.testimonial.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });
    }

    async create(dto: CreateTestimonialDto) {
        return this.prisma.testimonial.create({
            data: dto
        });
    }

    async update(id: string, dto: UpdateTestimonialDto) {
        const testimonial = await this.prisma.testimonial.findUnique({ where: { id } });
        if (!testimonial) throw new NotFoundException('Testimonial not found');

        return this.prisma.testimonial.update({
            where: { id },
            data: dto
        });
    }

    async delete(id: string) {
        const testimonial = await this.prisma.testimonial.findUnique({ where: { id } });
        if (!testimonial) throw new NotFoundException('Testimonial not found');

        return this.prisma.testimonial.update({
            where: { id },
            data: { isActive: false }
        });
    }
}
