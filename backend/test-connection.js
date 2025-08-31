require('dotenv').config();
const mongoose = require('mongoose');

async function testConnection() {
    try {
        console.log('🔄 Testing MongoDB connection...');
        console.log('📍 Current time (UTC):', new Date().toISOString());
        
        // Mask password in URI for logging
        const maskedUri = process.env.MONGODB_URI.replace(/:([^:@]+)@/, ':***@');
        console.log('🔗 URI:', maskedUri);
        
        // Check if database name is in URI
        const dbNameMatch = process.env.MONGODB_URI.match(/\.net\/([^?]+)/);
        const dbName = dbNameMatch ? dbNameMatch[1] : 'NOT_SPECIFIED';
        console.log('🗄️  Database name:', dbName);
        
        console.log('⏳ Connecting with updated options...');
        
        await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 5,
            maxIdleTimeMS: 30000,
            family: 4
        });
        
        console.log('✅ Connected successfully!');
        console.log('🏠 Host:', mongoose.connection.host);
        console.log('🗄️  Database:', mongoose.connection.name);
        console.log('📊 Ready state:', mongoose.connection.readyState);
        
        // Test a simple operation
        console.log('🔍 Testing database operations...');
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('📂 Collections found:', collections.map(c => c.name).join(', ') || 'None');
        
        // Test creating a simple document
        const testCollection = mongoose.connection.db.collection('connectiontest');
        const result = await testCollection.insertOne({ 
            test: true, 
            timestamp: new Date(),
            user: 'aadeshshukla'
        });
        console.log('✅ Test document created:', result.insertedId);
        
        // Clean up test document
        await testCollection.deleteOne({ _id: result.insertedId });
        console.log('🧹 Test document cleaned up');
        
        await mongoose.connection.close();
        console.log('✅ Connection closed successfully');
        console.log('\n🎉 Database is ready! You can now run: npm run seed');
        process.exit(0);
    } catch (error) {
        console.error('❌ Connection failed:', error.message);
        
        // Provide specific guidance
        if (error.message.includes('not supported')) {
            console.log('\n🔧 Solution: Mongoose option compatibility issue fixed');
            console.log('The configuration has been updated for your Mongoose version.');
        } else if (error.message.includes('IP that isn\'t whitelisted')) {
            console.log('\n🔧 Solution: Add your IP address to MongoDB Atlas whitelist');
        } else if (error.message.includes('Authentication failed')) {
            console.log('\n🔧 Solution: Check your username and password');
        }
        
        process.exit(1);
    }
}

console.log('🚀 MongoDB Connection Test');
console.log('👤 User: aadeshshukla');
console.log('📅 Date:', new Date().toISOString());
console.log('');

testConnection();