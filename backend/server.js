const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bodyParser = require('body-parser');
const path = require('path');
require('dotenv').config();

// Database connection
const connectDB = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/orders');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to database with retry logic
const startServer = async () => {
    try {
        await connectDB();
        
        // Security middleware
        app.use(helmet());

        // Rate limiting
        const limiter = rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100 // limit each IP to 100 requests per windowMs
        });
        app.use('/api', limiter);

        // CORS configuration
        app.use(cors({
            origin: process.env.NODE_ENV === 'production' 
                ? ['https://yourdomain.com'] 
                : ['http://localhost:3000', 'http://127.0.0.1:3000'],
            credentials: true
        }));

        // Body parser middleware
        app.use(bodyParser.json({ limit: '10mb' }));
        app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

        // Serve static files from frontend
        app.use(express.static(path.join(__dirname, '../frontend')));

        // API Routes
        app.use('/api/auth', authRoutes);
        app.use('/api/users', userRoutes);
        app.use('/api/products', productRoutes);
        app.use('/api/cart', cartRoutes);
        app.use('/api/orders', orderRoutes);

        // Health check endpoint
        app.get('/api/health', async (req, res) => {
            try {
                // Test database connection
                const mongoose = require('mongoose');
                const isConnected = mongoose.connection.readyState === 1;
                
                res.json({
                    success: true,
                    message: 'Server is running',
                    database: isConnected ? 'Connected' : 'Disconnected',
                    timestamp: new Date().toISOString()
                });
            } catch (error) {
                res.status(500).json({
                    success: false,
                    message: 'Health check failed',
                    error: error.message
                });
            }
        });

        // Serve frontend routes
        app.get('/', (req, res) => {
            res.sendFile(path.join(__dirname, '../frontend/index.html'));
        });

        app.get('/login', (req, res) => {
            res.sendFile(path.join(__dirname, '../frontend/pages/login.html'));
        });

        app.get('/register', (req, res) => {
            res.sendFile(path.join(__dirname, '../frontend/pages/register.html'));
        });

        app.get('/profile', (req, res) => {
            res.sendFile(path.join(__dirname, '../frontend/pages/profile.html'));
        });

        app.get('/product/:id', (req, res) => {
            res.sendFile(path.join(__dirname, '../frontend/pages/product-details.html'));
        });

        app.get('/cart', (req, res) => {
            res.sendFile(path.join(__dirname, '../frontend/pages/cart.html'));
        });

        app.get('/checkout', (req, res) => {
            res.sendFile(path.join(__dirname, '../frontend/pages/checkout.html'));
        });

        // Error handling middleware
        app.use((err, req, res, next) => {
            console.error(err.stack);
            
            res.status(err.status || 500).json({
                success: false,
                message: err.message || 'Internal Server Error',
                ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
            });
        });

        // Handle 404
        app.use('*', (req, res) => {
            if (req.originalUrl.startsWith('/api')) {
                res.status(404).json({
                    success: false,
                    message: 'API endpoint not found'
                });
            } else {
                res.sendFile(path.join(__dirname, '../frontend/index.html'));
            }
        });

        app.listen(PORT, () => {
            console.log(`✅ Server running on http://localhost:${PORT}`);
            console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🕒 Started at: ${new Date().toLocaleString()}`);
        });

    } catch (error) {
        console.error('❌ Failed to start server:', error.message);
        process.exit(1);
    }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
    console.log('\n🛑 Received SIGINT. Graceful shutdown...');
    try {
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        console.log('✅ Database connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});

process.on('SIGTERM', async () => {
    console.log('\n🛑 Received SIGTERM. Graceful shutdown...');
    try {
        const mongoose = require('mongoose');
        await mongoose.connection.close();
        console.log('✅ Database connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error during shutdown:', error);
        process.exit(1);
    }
});

// Start the server
startServer();