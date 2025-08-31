const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = require('../config/database');
const User = require('../models/User');
const Product = require('../models/Product');

// Sample products data (keeping the existing products)
const products = [
    {
        name: "Wireless Bluetooth Headphones",
        description: "Premium wireless headphones with active noise cancellation, 30-hour battery life, and crystal-clear sound quality. Perfect for music lovers and professionals.",
        price: 199.99,
        images: [
            {
                url: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
                alt: "Wireless Bluetooth Headphones"
            }
        ],
        category: "Electronics",
        brand: "AudioTech",
        stock: 50,
        sku: "AT-WH-001",
        specifications: [
            { name: "Battery Life", value: "30 hours" },
            { name: "Connectivity", value: "Bluetooth 5.0" },
            { name: "Weight", value: "250g" }
        ],
        tags: ["wireless", "bluetooth", "headphones", "audio"]
    },
    {
        name: "Smartphone Pro Max",
        description: "Latest flagship smartphone with advanced camera system, 5G connectivity, and all-day battery life. Features premium design and cutting-edge technology.",
        price: 999.99,
        images: [
            {
                url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800",
                alt: "Smartphone Pro Max"
            }
        ],
        category: "Electronics",
        brand: "TechCorp",
        stock: 30,
        sku: "TC-SP-002",
        specifications: [
            { name: "Display", value: "6.7 inch OLED" },
            { name: "Storage", value: "256GB" },
            { name: "Camera", value: "108MP Triple Camera" }
        ],
        tags: ["smartphone", "mobile", "5g", "camera"]
    },
    {
        name: "Gaming Laptop Ultra",
        description: "High-performance gaming laptop with latest graphics card, fast processor, and RGB keyboard. Perfect for gaming and professional work.",
        price: 1899.99,
        images: [
            {
                url: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=800",
                alt: "Gaming Laptop Ultra"
            }
        ],
        category: "Electronics",
        brand: "GameTech",
        stock: 15,
        sku: "GT-LP-003",
        specifications: [
            { name: "Processor", value: "Intel i7-12700H" },
            { name: "Graphics", value: "RTX 4070" },
            { name: "RAM", value: "32GB DDR5" }
        ],
        tags: ["laptop", "gaming", "computer", "rgb"]
    },
    {
        name: "Running Shoes Elite",
        description: "Professional running shoes with advanced cushioning technology, breathable mesh upper, and durable rubber outsole for all terrains.",
        price: 159.99,
        images: [
            {
                url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
                alt: "Running Shoes Elite"
            }
        ],
        category: "Sports",
        brand: "SportMax",
        stock: 75,
        sku: "SM-RS-004",
        specifications: [
            { name: "Weight", value: "280g" },
            { name: "Drop", value: "10mm" },
            { name: "Upper", value: "Breathable Mesh" }
        ],
        tags: ["running", "shoes", "sports", "fitness"]
    },
    {
        name: "Smart Coffee Maker",
        description: "WiFi-enabled coffee maker with app control, programmable brewing, and built-in grinder. Wake up to freshly brewed coffee every morning.",
        price: 299.99,
        images: [
            {
                url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800",
                alt: "Smart Coffee Maker"
            }
        ],
        category: "Home",
        brand: "BrewMaster",
        stock: 40,
        sku: "BM-CM-005",
        specifications: [
            { name: "Capacity", value: "12 cups" },
            { name: "Connectivity", value: "WiFi" },
            { name: "Grinder", value: "Built-in Burr Grinder" }
        ],
        tags: ["coffee", "smart", "kitchen", "appliance"]
    },
    {
        name: "Travel Backpack Pro",
        description: "Durable travel backpack with multiple compartments, laptop sleeve, and weather-resistant material. Perfect for business travel and adventures.",
        price: 89.99,
        images: [
            {
                url: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800",
                alt: "Travel Backpack Pro"
            }
        ],
        category: "Clothing",
        brand: "TravelGear",
        stock: 60,
        sku: "TG-BP-006",
        specifications: [
            { name: "Capacity", value: "35L" },
            { name: "Laptop Sleeve", value: "Up to 17 inch" },
            { name: "Material", value: "Water-resistant Nylon" }
        ],
        tags: ["backpack", "travel", "laptop", "durable"]
    }
];

// Sample users
const users = [
    {
        firstName: "Admin",
        lastName: "User",
        email: "admin@ecommerce.com",
        password: "Admin123!",
        role: "admin"
    },
    {
        firstName: "John",
        lastName: "Doe",
        email: "john.doe@example.com",
        password: "User123!",
        role: "user"
    },
    {
        firstName: "Aadesh",
        lastName: "Shukla",
        email: "aadesh.shukla@example.com",
        password: "Dev123!",
        role: "user"
    }
];

async function seedDatabase() {
    try {
        console.log('🌱 Starting database seeding...');
        console.log('👤 Seeding by: aadeshshukla');
        console.log('📅 Date:', new Date().toISOString());
        
        // Connect to database
        await connectDB();
        
        console.log('🧹 Clearing existing data...');
        
        // Clear existing data
        await User.deleteMany({});
        await Product.deleteMany({});
        
        console.log('👥 Creating users...');
        
        // Create users
        const createdUsers = await User.create(users);
        console.log(`✅ Created ${createdUsers.length} users successfully`);

        console.log('📦 Creating products...');
        
        // Create products
        const createdProducts = await Product.create(products);
        console.log(`✅ Created ${createdProducts.length} products successfully`);

        console.log('\n🎉 Database seeded successfully!');
        console.log('\n📋 Login Credentials:');
        console.log('👑 Admin User:');
        console.log('   Email: admin@ecommerce.com');
        console.log('   Password: Admin123!');
        console.log('\n👤 Test Users:');
        console.log('   Email: john.doe@example.com');
        console.log('   Password: User123!');
        console.log('   ');
        console.log('   Email: aadesh.shukla@example.com');
        console.log('   Password: Dev123!');
        
        console.log('\n🚀 Next Steps:');
        console.log('1. Start the server: npm run dev');
        console.log('2. Visit: http://localhost:3000');
        console.log('3. Login with admin credentials to access all features');

        process.exit(0);
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        process.exit(1);
    }
}

// Handle process termination
process.on('SIGINT', async () => {
    console.log('\nReceived SIGINT. Closing database connection...');
    await mongoose.connection.close();
    process.exit(0);
});

// Run seeder
seedDatabase();