import { PrismaClient } from '@prisma/client';

async function main() {
    process.env.DATABASE_URL = 'file:./prisma/dev.db';
    const prisma = new PrismaClient();
    try {
        const count = await prisma.order.count();
        console.log(`ORDER_COUNT_PRISMA:${count}`);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
