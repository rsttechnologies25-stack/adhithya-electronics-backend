import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';

const prisma = new PrismaClient();

async function exportRealData() {
    console.log('Starting real data export (excluding sample data)...\n');

    // Export Users (all are real)
    const users = await prisma.user.findMany({
        include: { addresses: true }
    });
    console.log(`Users: ${users.length}`);

    // Export Categories
    const categories = await prisma.category.findMany();
    console.log(`Categories: ${categories.length}`);

    // Export Products with all relations
    const products = await prisma.product.findMany({
        include: {
            variants: true,
            media: true,
            specs: true
        }
    });
    console.log(`Products: ${products.length}`);

    // Export ONLY real orders (exclude sample data with isSample: true)
    const allOrders = await prisma.order.findMany({
        include: {
            items: true,
            payments: true
        }
    });
    const realOrders = allOrders.filter((order: any) => !order.metadata?.isSample);
    console.log(`Orders (real only, excluding sample): ${realOrders.length}`);

    // Export Reviews
    const reviews = await prisma.review.findMany();
    console.log(`Reviews: ${reviews.length}`);

    // Export Branches
    const branches = await prisma.branch.findMany();
    console.log(`Branches: ${branches.length}`);

    // Export Branch Reviews
    const branchReviews = await prisma.branchReview.findMany();
    console.log(`Branch Reviews: ${branchReviews.length}`);

    // Export Partners
    const partners = await prisma.partner.findMany();
    console.log(`Partners: ${partners.length}`);

    // Export Testimonials
    const testimonials = await prisma.testimonial.findMany();
    console.log(`Testimonials: ${testimonials.length}`);

    // Export Support Tickets
    const tickets = await prisma.supportTicket.findMany({
        include: { messages: true }
    });
    console.log(`Support Tickets: ${tickets.length}`);

    // Export Coupons
    const coupons = await prisma.coupon.findMany();
    console.log(`Coupons: ${coupons.length}`);

    // Create export object
    const exportData = {
        exportedAt: new Date().toISOString(),
        excludedSampleOrders: allOrders.length - realOrders.length,
        data: {
            users,
            categories,
            products,
            orders: realOrders,
            reviews,
            branches,
            branchReviews,
            partners,
            testimonials,
            tickets,
            coupons
        }
    };

    // Write to file
    const filename = `data-export-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
    console.log(`\n✅ Data exported to: ${filename}`);
    console.log(`Total sample orders excluded: ${allOrders.length - realOrders.length}`);
}

exportRealData()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
