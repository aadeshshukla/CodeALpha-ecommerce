const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
    try {
        // Set mongoose options
        mongoose.set('strictQuery', false);
        
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000, // 30 seconds
            socketTimeoutMS: 45000, // 45 seconds
            maxPoolSize: 10, // Maintain up to 10 socket connections
            minPoolSize: 5, // Maintain at least 5 socket connections
            maxIdleTimeMS: 30000, // Close connections after 30 seconds of inactivity
            family: 4 // Use IPv4, skip trying IPv6
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });

        return conn;
    } catch (error) {
        console.error('Database connection error:', error.message);
        
        // Provide specific guidance based on error
        if (error.message.includes('authentication failed')) {
            console.log('\n🔧 Authentication Error - Check your MongoDB credentials');
        } else if (error.message.includes('ENOTFOUND') || error.message.includes('timeout')) {
            console.log('\n🔧 Network Error - Check your internet connection and MongoDB Atlas network access');
        } else if (error.message.includes('not supported')) {
            console.log('\n🔧 Configuration Error - Mongoose option compatibility issue');
        }
        
        process.exit(1);
    }
};

module.exports = connectDB;