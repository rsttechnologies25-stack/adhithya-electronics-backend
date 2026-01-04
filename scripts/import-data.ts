import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function importData(dataFile: string) {
    console.log(`Importing data from ${dataFile}...\n`);

    const rawData = fs.readFileSync(dataFile, 'utf-8');
    const exportData = JSON.parse(rawData);
    const data = exportData.data;

    // Import order matters for foreign key constraints

    // 1. Import Users (without addresses first)
    console.log('Importing users...');
    for (const user of data.users) {
        const { addresses, ...userData } = user;
        await prisma.user.upsert({
            where: { id: user.id },
            update: userData,
            create: userData
        });
    }
    console.log(`  ✓ ${data.users.length} users imported`);

    // 2. Import Addresses
    console.log('Importing addresses...');
    for (const user of data.users) {
        for (const addr of user.addresses || []) {
            await prisma.address.upsert({
                where: { id: addr.id },
                update: addr,
                create: addr
            });
        }
    }
    console.log(`  ✓ Addresses imported`);

    // 3. Import Categories
    console.log('Importing categories...');
    for (const cat of data.categories) {
        await prisma.category.upsert({
            where: { id: cat.id },
            update: cat,
            create: cat
        });
    }
    console.log(`  ✓ ${data.categories.length} categories imported`);

    // 4. Import Products
    console.log('Importing products...');
    for (const prod of data.products) {
        const { variants, media, specs, ...productData } = prod;
        await prisma.product.upsert({
            where: { id: prod.id },
            update: productData,
            create: productData
        });

        // Import media
        for (const m of media || []) {
            await prisma.productMedia.upsert({
                where: { id: m.id },
                update: m,
                create: m
            });
        }

        // Import specs
        for (const s of specs || []) {
            await prisma.productSpecification.upsert({
                where: { id: s.id },
                update: s,
                create: s
            });
        }

        // Import variants
        for (const v of variants || []) {
            await prisma.productVariant.upsert({
                where: { id: v.id },
                update: v,
                create: v
            });
        }
    }
    console.log(`  ✓ ${data.products.length} products imported`);

    // 5. Import Branches
    console.log('Importing branches...');
    for (const branch of data.branches) {
        await prisma.branch.upsert({
            where: { id: branch.id },
            update: branch,
            create: branch
        });
    }
    console.log(`  ✓ ${data.branches.length} branches imported`);

    // 6. Import Branch Reviews
    console.log('Importing branch reviews...');
    for (const review of data.branchReviews) {
        await prisma.branchReview.upsert({
            where: { id: review.id },
            update: review,
            create: review
        });
    }
    console.log(`  ✓ ${data.branchReviews.length} branch reviews imported`);

    // 7. Import Partners
    console.log('Importing partners...');
    for (const partner of data.partners) {
        await prisma.partner.upsert({
            where: { id: partner.id },
            update: partner,
            create: partner
        });
    }
    console.log(`  ✓ ${data.partners.length} partners imported`);

    // 8. Import Testimonials
    console.log('Importing testimonials...');
    for (const test of data.testimonials) {
        await prisma.testimonial.upsert({
            where: { id: test.id },
            update: test,
            create: test
        });
    }
    console.log(`  ✓ ${data.testimonials.length} testimonials imported`);

    // 9. Import Orders (only real ones, should be 0 from export)
    if (data.orders && data.orders.length > 0) {
        console.log('Importing orders...');
        for (const order of data.orders) {
            const { items, payments, ...orderData } = order;
            await prisma.order.upsert({
                where: { id: order.id },
                update: orderData,
                create: orderData
            });
            for (const item of items || []) {
                await prisma.orderItem.upsert({
                    where: { id: item.id },
                    update: item,
                    create: item
                });
            }
        }
        console.log(`  ✓ ${data.orders.length} orders imported`);
    }

    console.log('\n✅ Data import complete!');
}

// Get filename from command line args
const dataFile = process.argv[2] || 'data-export-2026-01-04.json';
importData(dataFile)
    .catch(console.error)
    .finally(() => prisma.$disconnect());
