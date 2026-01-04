import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding data...');

    // 1. Create Categories
    const categories = [
        { name: 'Laptops', slug: 'laptops' },
        { name: 'Smartphones', slug: 'smartphones' },
        { name: 'Cameras', slug: 'cameras' },
        { name: 'Headphones', slug: 'headphones' },
        { name: 'Smartwatches', slug: 'smartwatches' },
        { name: 'Drones', slug: 'drones' },
        { name: 'TVs', slug: 'tvs' },
        { name: 'Accessories', slug: 'accessories' },
    ];

    for (const cat of categories) {
        await prisma.category.upsert({
            where: { slug: cat.slug },
            update: {},
            create: cat,
        });
    }

    const catMap = await prisma.category.findMany();
    const getCatId = (slug: string) => catMap.find((c) => c.slug === slug)?.id;

    // 2. Create Products
    const products = [
        {
            sku: 'LAP-001',
            name: 'High-Performance Gaming Laptop',
            slug: 'high-performance-gaming-laptop',
            brand: 'Dell',
            basePrice: 1899.99,
            categoryId: getCatId('laptops'),
            status: 'published',
            shortDescription: 'Latest generation gaming laptop with dedicated GPU.',
        },
        {
            sku: 'TV-001',
            name: 'Ultra HD Smart Television 65"',
            slug: 'ultra-hd-smart-television-65',
            brand: 'Samsung',
            basePrice: 1299.00,
            categoryId: getCatId('tvs'),
            status: 'published',
            shortDescription: 'Crystal clear 4K resolution with HDR support.',
        },
        {
            sku: 'HP-001',
            name: 'Wireless Noise-Cancelling Headphones',
            slug: 'wireless-noise-cancelling-headphones',
            brand: 'Sony',
            basePrice: 249.50,
            categoryId: getCatId('headphones'),
            status: 'published',
            shortDescription: 'Immersive sound with industry-leading noise cancellation.',
        },
        {
            sku: 'CAM-001',
            name: 'Professional DSLR Camera Kit',
            slug: 'professional-dslr-camera-kit',
            brand: 'Canon',
            basePrice: 999.00,
            categoryId: getCatId('cameras'),
            status: 'published',
            shortDescription: 'Complete kit for professional photography enthusiasts.',
        },
        {
            sku: 'SPK-001',
            name: 'Compact Portable Bluetooth Speaker',
            slug: 'compact-portable-bluetooth-speaker',
            brand: 'Bose',
            basePrice: 79.99,
            categoryId: getCatId('accessories'),
            status: 'published',
            shortDescription: 'Big sound in a small, water-resistant package.',
        },
        {
            sku: 'SW-001',
            name: 'Smartwatch with Fitness Tracker',
            slug: 'smartwatch-with-fitness-tracker',
            brand: 'Apple',
            basePrice: 189.00,
            categoryId: getCatId('smartwatches'),
            status: 'published',
            shortDescription: 'Stay healthy and connected with ease.',
        },
        {
            sku: 'SSD-001',
            name: 'High-Speed External SSD 1TB',
            slug: 'high-speed-external-ssd-1tb',
            brand: 'Samsung',
            basePrice: 119.99,
            categoryId: getCatId('accessories'),
            status: 'published',
            shortDescription: 'Lightning-fast data transfer and secure storage.',
        },
        {
            sku: 'MS-001',
            name: 'Ergonomic Wireless Mouse',
            slug: 'ergonomic-wireless-mouse',
            brand: 'Logitech',
            basePrice: 39.99,
            categoryId: getCatId('accessories'),
            status: 'published',
            shortDescription: 'Reduced wrist strain for long hours of use.',
        },
    ];

    for (const prod of products) {
        const product = await prisma.product.upsert({
            where: { sku: prod.sku },
            update: {
                brand: prod.brand,
                basePrice: prod.basePrice,
                categoryId: prod.categoryId,
                shortDescription: prod.shortDescription,
            },
            create: prod,
        });

        // Create a default variant for each product
        await prisma.productVariant.upsert({
            where: { sku: `${prod.sku}-DEF` },
            update: {
                price: prod.basePrice,
                title: 'Default',
            },
            create: {
                productId: product.id,
                sku: `${prod.sku}-DEF`,
                title: 'Default',
                price: prod.basePrice,
            },
        });
    }

    // 3. Create Branches
    const branches = [
        {
            slug: 'perambur',
            name: 'Adhithya Electronics - Perambur',
            area: 'Perambur',
            address: '#61/171, Madhavaram High Road, Near Brindha Theatre, Perambur, Chennai - 600011',
            description: 'Our flagship store in the heart of Perambur, offering a wide range of electronics with expert staff ready to help you find the perfect product. Established in 1995, this is where our journey began.',
            phone: '+91 9043811818',
            email: 'adhithyaelectronics97@gmail.com',
            googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.0147!2d80.2317!3d13.1067!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA2JzI0LjEiTiA4MMKwMTMnNTQuMSJF!5e0!3m2!1sen!2sin!4v1609459200000!5m2!1sen!2sin',
            latitude: 13.1067,
            longitude: 80.2317,
            openingTime: '09:00',
            closingTime: '21:00',
            workingDays: 'Mon-Sun',
            imageUrl: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800'
        },
        {
            slug: 'kolathur',
            name: 'Adhithya Electronics - Kolathur',
            area: 'Kolathur',
            address: '#3, Shiva Parvathi Nagar, Red Hills, Kolathur, Chennai - 600099',
            description: 'Experience premium electronics shopping at our Kolathur branch. Spacious showroom with the latest gadgets and home appliances, serving the Red Hills and Kolathur community.',
            phone: '+91 9962466888',
            email: 'adhithyaelectronics97@gmail.com',
            googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3886.2!2d80.2150!3d13.1217!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA3JzE4LjEiTiA4MMKwMTInNTQuMCJF!5e0!3m2!1sen!2sin!4v1609459200000!5m2!1sen!2sin',
            latitude: 13.1217,
            longitude: 80.2150,
            openingTime: '09:00',
            closingTime: '21:00',
            workingDays: 'Mon-Sun',
            imageUrl: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800'
        },
        {
            slug: 'villivakkam',
            name: 'Adhithya Electronics - Villivakkam',
            area: 'Villivakkam',
            address: 'Villivakkam High Road, Near Villivakkam Bus Terminus, Chennai - 600049',
            description: 'Your neighborhood electronics destination in Villivakkam. Quality products, competitive prices, and the same trusted service that Adhithya Electronics is known for.',
            phone: '+91 9043811818',
            email: 'adhithyaelectronics97@gmail.com',
            googleMapsEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3885.9!2d80.2083!3d13.1033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTPCsDA2JzExLjkiTiA4MMKwMTInMjkuOSJF!5e0!3m2!1sen!2sin!4v1609459200000!5m2!1sen!2sin',
            latitude: 13.1033,
            longitude: 80.2083,
            openingTime: '09:00',
            closingTime: '21:00',
            workingDays: 'Mon-Sun',
            imageUrl: 'https://images.unsplash.com/photo-1560472355-536de3962603?w=800'
        }
    ];

    // 4. Create Default Admin
    const bcrypt = require('bcryptjs');

    const admins = [
        {
            email: 'admin@adhithya.com',
            password: 'admin123',
            firstName: 'System',
            lastName: 'Administrator',
        },
        {
            email: 'superadmin@adhithya.com',
            password: 'password123',
            firstName: 'Super',
            lastName: 'Admin',
        }
    ];

    for (const admin of admins) {
        const hashedPassword = await bcrypt.hash(admin.password, 10);
        await prisma.user.upsert({
            where: { email: admin.email },
            update: {
                passwordHash: hashedPassword,
                role: 'ADMIN',
                firstName: admin.firstName,
                lastName: admin.lastName,
            },
            create: {
                email: admin.email,
                passwordHash: hashedPassword,
                role: 'ADMIN',
                firstName: admin.firstName,
                lastName: admin.lastName,
            },
        });
    }

    console.log('Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
