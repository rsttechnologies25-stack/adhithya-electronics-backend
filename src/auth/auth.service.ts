import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './auth.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService,
    ) { }

    async register(dto: RegisterDto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('Email already in use');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                passwordHash,
                firstName: dto.firstName,
                lastName: dto.lastName,
                phone: dto.phone,
                addresses: {
                    create: {
                        line1: dto.addressLine1,
                        line2: dto.addressLine2,
                        city: dto.city,
                        state: dto.state,
                        postalCode: dto.postalCode,
                        isDefault: true,
                    },
                },
            },
            include: {
                addresses: true,
            },
        });

        return this.generateToken(user);
    }

    async login(dto: LoginDto) {
        console.log(`[AUTH] Login attempt for: ${dto.email}`);
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (!user) {
            console.log(`[AUTH] User not found: ${dto.email}`);
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);

        if (!isPasswordValid) {
            console.log(`[AUTH] Invalid password for: ${dto.email}`);
            throw new UnauthorizedException('Invalid credentials');
        }

        console.log(`[AUTH] Login successful for: ${dto.email} (Role: ${user.role})`);
        return this.generateToken(user);
    }

    private generateToken(user: any) {
        const payload = {
            sub: user.id,
            email: user.email,
            role: user.role,
            name: `${user.firstName} ${user.lastName}`
        };

        return {
            user: {
                id: user.id,
                email: user.email,
                name: `${user.firstName} ${user.lastName}`,
                role: user.role,
            },
            access_token: this.jwtService.sign(payload),
        };
    }
}
