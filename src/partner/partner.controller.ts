import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards } from '@nestjs/common';
import { PartnerService } from './partner.service';
import { CreatePartnerDto, UpdatePartnerDto } from './partner.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('partners')
export class PartnerController {
    constructor(private readonly partnerService: PartnerService) { }

    @Get()
    async findAll() {
        return this.partnerService.findAll();
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() dto: CreatePartnerDto) {
        return this.partnerService.create(dto);
    }

    @Put(':id')
    @UseGuards(JwtAuthGuard)
    async update(@Param('id') id: string, @Body() dto: UpdatePartnerDto) {
        return this.partnerService.update(id, dto);
    }

    @Delete(':id')
    @UseGuards(JwtAuthGuard)
    async delete(@Param('id') id: string) {
        return this.partnerService.delete(id);
    }
}
