import { Body, Controller, Get, Post, Delete, Param, UseGuards, Request } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, MergeCartDto } from './cart.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('cart')
@UseGuards(JwtAuthGuard)
export class CartController {
    constructor(private readonly cartService: CartService) { }

    @Get()
    async getCart(@Request() req) {
        return this.cartService.getCart(req.user.id);
    }

    @Post('add')
    async addToCart(@Request() req, @Body() dto: AddToCartDto) {
        return this.cartService.addToCart(req.user.id, dto);
    }

    @Post('merge')
    async mergeCart(@Request() req, @Body() dto: MergeCartDto) {
        return this.cartService.mergeCart(req.user.id, dto);
    }

    @Delete(':variantId')
    async removeFromCart(@Request() req, @Param('variantId') variantId: string) {
        return this.cartService.removeFromCart(req.user.id, variantId);
    }
}
