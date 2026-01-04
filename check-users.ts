import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            role: true,
            firstName: true,
            lastName: true
        }
    });

    console.log('--- All Users in DB ---');
    console.log(JSON.stringify(users, null, 2));
    console.log('---------------------');
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
