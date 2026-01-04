import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@adhithya.com';
    const password = 'admin123';

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            console.log('❌ User not found');
            return;
        }

        console.log('User found:', user.email);
        console.log('Hash in DB:', user.passwordHash);

        const isValid = await bcrypt.compare(password, user.passwordHash);
        console.log('Is password valid?', isValid);

        // Let's also test a fresh hash
        const freshHash = await bcrypt.hash(password, 10);
        console.log('Fresh hash for "admin123":', freshHash);
        const secondCheck = await bcrypt.compare(password, freshHash);
        console.log('Is fresh hash valid?', secondCheck);

    } catch (e) {
        console.error('Error:', e.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
