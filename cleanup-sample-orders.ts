import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanup() {
    console.log('Starting sample data cleanup...');

    // Fetch all orders and filter in memory (SQLite limitation)
    const result = await prisma.order.findMany({
        select: { id: true, metadata: true }
    });

    const ids = result.map(o => o.id);

    if (ids.length === 0) {
        // Fallback for SQLite which might not support deep JSON filtering well in findMany
        const allOrders = await prisma.order.findMany({ select: { id: true, metadata: true } });
        const sampleIds = allOrders.filter((o: any) => o.metadata?.isSample === true).map((o: any) => o.id);

        if (sampleIds.length > 0) {
            await prisma.orderItem.deleteMany({ where: { orderId: { in: sampleIds } } });
            await prisma.order.deleteMany({ where: { id: { in: sampleIds } } });
            console.log(`Cleaned up ${sampleIds.length} sample orders via fallback.`);
        } else {
            console.log('No sample orders found.');
        }
    } else {
        await prisma.orderItem.deleteMany({ where: { orderId: { in: ids } } });
        await prisma.order.deleteMany({ where: { id: { in: ids } } });
        console.log(`Cleaned up ${ids.length} sample orders.`);
    }
}

cleanup()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
