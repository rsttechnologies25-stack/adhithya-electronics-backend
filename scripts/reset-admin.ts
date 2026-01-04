import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const email = 'admin@adhithya.com';
    const password = 'admin123';
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log(`Resetting password for ${email}...`);

    try {
        const user = await prisma.user.upsert({
            where: { email },
            update: {
                passwordHash: hashedPassword,
                role: 'ADMIN',
            },
            create: {
                email,
                passwordHash: hashedPassword,
                role: 'ADMIN',
                firstName: 'System',
                lastName: 'Administrator',
            },
        });
        console.log('✅ Admin password reset successfully!');
        console.log('User ID:', user.id);
    } catch (error) {
        console.error('❌ Failed to reset password:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

main();
