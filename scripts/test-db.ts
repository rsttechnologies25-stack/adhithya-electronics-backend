import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    try {
        const count = await prisma.user.count();
        console.log('USER_COUNT:', count);
        const admin = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
        console.log('ADMIN_EMAIL:', admin ? admin.email : 'NONE');
    } catch (e) {
        console.error('DB_ERROR:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
