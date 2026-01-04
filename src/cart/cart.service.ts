import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto, MergeCartDto } from './cart.dto';

@Injectable()
export class CartService {
    constructor(private readonly prisma: PrismaService) { }

    async getCart(userId: string) {
        let cart = await this.prisma.cart.findFirst({
            where: { userId },
            include: {
                items: {
                    include: {
                        variant: {
                            include: {
                                product: true
                            }
                        }
                    }
                }
            }
        });

        if (!cart) {
            cart = await this.prisma.cart.create({
                data: { userId },
                include: {
                    items: {
                        include: {
                            variant: {
                                include: {
                                    product: true
                                }
                            }
                        }
                    }
                }
            });
        }

        return cart;
    }

    async addToCart(userId: string, dto: AddToCartDto) {
        const cart = await this.getCart(userId);
        let variant = await this.prisma.productVariant.findUnique({
            where: { id: dto.variantId }
        });

        if (!variant) {
            // Check if it's actually a Product ID and get its first variant
            variant = await this.prisma.productVariant.findFirst({
                where: { productId: dto.variantId }
            });

            if (!variant) {
                throw new Error('Product variant not found for ID: ' + dto.variantId);
            }

            // Update dto.variantId so the rest of the logic uses the correct variant ID
            dto.variantId = variant.id;
        }

        const existingItem = await this.prisma.cartItem.findFirst({
            where: {
                cartId: cart.id,
                variantId: dto.variantId
            }
        });

        if (existingItem) {
            return this.prisma.cartItem.update({
                where: { id: existingItem.id },
                data: { quantity: existingItem.quantity + dto.quantity }
            });
        }

        return this.prisma.cartItem.create({
            data: {
                cartId: cart.id,
                variantId: dto.variantId,
                quantity: dto.quantity,
                unitPrice: variant.price || 0
            }
        });
    }

    async mergeCart(userId: string, dto: MergeCartDto) {
        const cart = await this.getCart(userId);

        for (const item of dto.items) {
            const variant = await this.prisma.productVariant.findUnique({
                where: { id: item.variantId }
            });

            if (!variant) continue;

            const existingItem = await this.prisma.cartItem.findFirst({
                where: {
                    cartId: cart.id,
                    variantId: item.variantId
                }
            });

            if (existingItem) {
                await this.prisma.cartItem.update({
                    where: { id: existingItem.id },
                    data: { quantity: existingItem.quantity + item.quantity }
                });
            } else {
                await this.prisma.cartItem.create({
                    data: {
                        cartId: cart.id,
                        variantId: item.variantId,
                        quantity: item.quantity,
                        unitPrice: variant.price || 0
                    }
                });
            }
        }

        return this.getCart(userId);
    }

    async removeFromCart(userId: string, variantId: string) {
        const cart = await this.prisma.cart.findFirst({
            where: { userId }
        });

        if (!cart) {
            return { success: true };
        }

        await this.prisma.cartItem.deleteMany({
            where: {
                cartId: cart.id,
                variantId: variantId
            }
        });

        return { success: true };
    }
}
