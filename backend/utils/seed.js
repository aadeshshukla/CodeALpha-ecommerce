const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const connectDB = require('../config/database');
const User = require('../models/User');
const Product = require('../models/Product');

// Sample products data
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
        category: "Fashion",
        brand: "TravelGear",
        stock: 60,
        sku: "TG-BP-006",
        specifications: [
            { name: "Capacity", value: "35L" },
            { name: "Laptop Sleeve", value: "Up to 17 inch" },
            { name: "Material", value: "Water-resistant Nylon" }
        ],
        tags: ["backpack", "travel", "laptop", "durable"]
    },
    {
        name: "Wireless Charging Stand",
        description: "Fast wireless charging stand compatible with all Qi-enabled devices. Features adjustable viewing angle and LED charging indicator.",
        price: 49.99,
        images: [
            {
                url: "https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?w=800",
                alt: "Wireless Charging Stand"
            }
        ],
        category: "Electronics",
        brand: "ChargeTech",
        stock: 100,
        sku: "CT-WC-007",
        specifications: [
            { name: "Power Output", value: "15W Fast Charging" },
            { name: "Compatibility", value: "Qi-enabled devices" },
            { name: "Angle", value: "Adjustable 0-60°" }
        ],
        tags: ["wireless", "charging", "stand", "fast"]
    },
    {
        name: "Fitness Tracker Watch",
        description: "Advanced fitness tracker with heart rate monitoring, GPS, sleep tracking, and 7-day battery life. Track your health and fitness goals.",
        price: 199.99,
        images: [
            {
                url: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
                alt: "Fitness Tracker Watch"
            }
        ],
        category: "Sports",
        brand: "FitTech",
        stock: 80,
        sku: "FT-FW-008",
        specifications: [
            { name: "Battery Life", value: "7 days" },
            { name: "Water Rating", value: "50m waterproof" },
            { name: "Sensors", value: "Heart Rate, GPS, Accelerometer" }
        ],
        tags: ["fitness", "tracker", "watch", "health"]
    }
];

// Sample admin user
const adminUser = {
    firstName: "Admin",
    lastName: "User",
    email: "admin@ecommerce.com",
    password: "Admin123!",
    role: "admin"
};

// Sample regular user
const regularUser = {
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    password: "User123!",
    role: "user"
};

async function seedDatabase() {
    try {
        // Connect to database
        await connectDB();

        // Clear existing data
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Product.deleteMany({});

        // Create users
        console.log('Creating users...');
        await User.create([adminUser, regularUser]);
        console.log('Users created successfully');

        // Create products
        console.log('Creating products...');
        await Product.create(products);
        console.log('Products created successfully');

        console.log('Database seeded successfully!');
        console.log('\nDefault Admin User:');
        console.log('Email: admin@ecommerce.com');
        console.log('Password: Admin123!');
        console.log('\nDefault Test User:');
        console.log('Email: john.doe@example.com');
        console.log('Password: User123!');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
}

// Run seeder
seedDatabase();