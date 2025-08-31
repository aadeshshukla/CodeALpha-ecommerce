require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    try {
        console.log('Testing MongoDB connection...');
        console.log('URI:', process.env.MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
        
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });
        
        console.log('✅ Connected successfully!');
        
        // Test a simple query
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📂 Collections:', collections.map(c => c.name));
        
        await mongoose.connection.close();
        console.log('✅ Connection closed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        process.exit(1);
    }
}

testConnection();