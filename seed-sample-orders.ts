import { PrismaClient, OrderStatus, PaymentStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function seed() {
    console.log('Starting reversible data seed...');

    // Config
    const USER_ID = '62aa2692-2bca-4501-9965-dc609e9782e7';
    const VARIANT_ID = '60cb7c48-997d-46dc-965c-3954c0a356e1';
    const ADDRESS_ID = '5b3420eb-7198-4fda-8a53-c16806762133';
    const NUM_ORDERS = 35;

    const orders: string[] = [];
    const now = new Date();

    for (let i = 0; i < NUM_ORDERS; i++) {
        // Random date in last 60 days
        const date = new Date(now.getTime() - Math.random() * 60 * 24 * 60 * 60 * 1000);
        const orderNumber = `ORD-SAMPLE-${Math.floor(100000 + Math.random() * 900000)}`;
        const total = Math.floor(5000 + Math.random() * 45000);

        const order = await prisma.order.create({
            data: {
                orderNumber,
                userId: USER_ID,
                status: Math.random() > 0.3 ? OrderStatus.DELIVERED : OrderStatus.FULFILLED,
                paymentStatus: PaymentStatus.PAID,
                subtotal: total * 0.8,
                tax: total * 0.1,
                shippingCost: total * 0.1,
                discountTotal: 0,
                total: total,
                billingAddressId: ADDRESS_ID,
                shippingAddressId: ADDRESS_ID,
                createdAt: date,
                updatedAt: date,
                metadata: { isSample: true }, // TAG FOR REMOVAL
                items: {
                    create: [
                        {
                            variantId: VARIANT_ID,
                            quantity: 1,
                            unitPrice: total,
                            discountApplied: 0,
                            totalPrice: total
                        }
                    ]
                }
            }
        });
        orders.push(order.id);
    }

    console.log(`Successfully seeded ${orders.length} orders tagged with { isSample: true }.`);
}

seed()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
