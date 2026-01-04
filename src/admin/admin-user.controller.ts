import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateAdminUserDto, UpdateAdminUserDto } from './admin-user.dto';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

@Controller('admin/users')
@UseGuards(JwtAuthGuard)
export class AdminUserController {
    constructor(private readonly prisma: PrismaService) { }

    @Get()
    async findAll() {
        return this.prisma.user.findMany({
            where: {
                role: {
                    not: Role.CUSTOMER
                }
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phone: true,
                role: true,
                createdAt: true,
            }
        });
    }

    @Post()
    async create(@Body() dto: CreateAdminUserDto) {
        const passwordHash = await bcrypt.hash(dto.password, 10);
        return this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                role: dto.role || Role.ADMIN,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            }
        });
    }

    @Put(':id')
    async update(@Param('id') id: string, @Body() dto: UpdateAdminUserDto) {
        const data: any = { ...dto };
        if (dto.password) {
            data.passwordHash = await bcrypt.hash(dto.password, 10);
            delete data.password;
        }

        return this.prisma.user.update({
            where: { id },
            data,
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                role: true,
            }
        });
    }

    @Delete(':id')
    async remove(@Param('id') id: string) {
        // Prevent deleting the last admin if possible, but for now just basic delete
        // We could add a check here
        return this.prisma.user.delete({
            where: { id }
        });
    }
}
