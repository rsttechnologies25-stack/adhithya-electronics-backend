import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- Listing All Users ---');
    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                email: true,
                role: true,
                createdAt: true
            }
        });
        console.log(`Found ${users.length} users:`);
        users.forEach(u => {
            console.log(`- ${u.email} (ID: ${u.id}, Role: ${u.role}, Created: ${u.createdAt})`);
        });

        console.log('\n--- Checking for exact match of "admin@adhithya.com" ---');
        const exactMatch = await prisma.user.findUnique({ where: { email: 'admin@adhithya.com' } });
        console.log('Exact match found:', exactMatch ? 'YES' : 'NO');

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
