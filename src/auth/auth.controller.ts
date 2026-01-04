import { Body, Controller, Post, HttpCode, HttpStatus, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    async register(@Body() dto: RegisterDto) {
        console.log('Received registration request:', dto);
        try {
            const result = await this.authService.register(dto);
            console.log('Registration successful for:', dto.email);
            return result;
        } catch (error) {
            console.error('Registration failed for:', dto.email, error);
            throw error;
        }
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto) {
        console.log('Received login request:', dto.email);
        return this.authService.login(dto);
    }
}
