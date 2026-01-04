import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePartnerDto, UpdatePartnerDto } from './partner.dto';

@Injectable()
export class PartnerService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll() {
        return this.prisma.partner.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });
    }

    async create(dto: CreatePartnerDto) {
        return this.prisma.partner.create({
            data: dto
        });
    }

    async update(id: string, dto: UpdatePartnerDto) {
        const partner = await this.prisma.partner.findUnique({ where: { id } });
        if (!partner) throw new NotFoundException('Partner not found');

        return this.prisma.partner.update({
            where: { id },
            data: dto
        });
    }

    async delete(id: string) {
        const partner = await this.prisma.partner.findUnique({ where: { id } });
        if (!partner) throw new NotFoundException('Partner not found');

        return this.prisma.partner.update({
            where: { id },
            data: { isActive: false }
        });
    }
}
