import { PrismaClient } from '@prisma/client';

async function main() {
    const prisma = new PrismaClient();
    try {
        const count = await prisma.order.count();
        console.log(`ORDER_COUNT:${count}`);

        const latestOrders = await prisma.order.findMany({
            take: 5,
            select: { createdAt: true, total: true }
        });
        console.log('LATEST_ORDERS:', JSON.stringify(latestOrders));
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
