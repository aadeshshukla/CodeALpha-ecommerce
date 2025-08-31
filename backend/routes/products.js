const express = require('express');
const Product = require('../models/Product');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/products
// @desc    Get all products with filtering, sorting, and pagination
// @access  Public
router.get('/', async (req, res) => {
    try {
        console.log('📦 Fetching products...');
        
        const {
            page = 1,
            limit = 12,
            category,
            minPrice,
            maxPrice,
            search,
            sort = '-createdAt'
        } = req.query;

        // Build filter object
        const filter = { isActive: true };

        if (category) {
            filter.category = category;
        }

        if (minPrice || maxPrice) {
            filter.price = {};
            if (minPrice) filter.price.$gte = Number(minPrice);
            if (maxPrice) filter.price.$lte = Number(maxPrice);
        }

        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } }
            ];
        }

        console.log('🔍 Filter:', filter);

        // Calculate pagination
        const skip = (page - 1) * limit;

        // Execute query with timeout
        const products = await Product.find(filter)
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .select('-__v')
            .maxTimeMS(30000); // 30 second timeout

        console.log(`✅ Found ${products.length} products`);

        // Get total count for pagination
        const total = await Product.countDocuments(filter).maxTimeMS(30000);

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(total / limit),
                    totalProducts: total,
                    hasNext: skip + limit < total,
                    hasPrev: page > 1
                }
            }
        });
    } catch (error) {
        console.error('❌ Get products error:', error);
        
        if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
            return res.status(503).json({
                success: false,
                message: 'Database connection timeout. Please try again.',
                error: 'DATABASE_TIMEOUT'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error fetching products',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/products/:id
// @desc    Get single product
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        console.log(`📦 Fetching product: ${req.params.id}`);
        
        const product = await Product.findById(req.params.id).maxTimeMS(30000);

        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        console.log(`✅ Found product: ${product.name}`);

        res.json({
            success: true,
            data: { product }
        });
    } catch (error) {
        console.error('❌ Get product error:', error);
        
        if (error.name === 'CastError') {
            return res.status(400).json({
                success: false,
                message: 'Invalid product ID'
            });
        }
        
        if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
            return res.status(503).json({
                success: false,
                message: 'Database connection timeout. Please try again.',
                error: 'DATABASE_TIMEOUT'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error fetching product',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   GET /api/products/category/:category
// @desc    Get products by category
// @access  Public
router.get('/category/:category', async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 12, sort = '-createdAt' } = req.query;

        const skip = (page - 1) * limit;

        const products = await Product.find({
            category: { $regex: new RegExp(category, 'i') },
            isActive: true
        })
            .sort(sort)
            .skip(skip)
            .limit(Number(limit))
            .maxTimeMS(30000);

        const total = await Product.countDocuments({
            category: { $regex: new RegExp(category, 'i') },
            isActive: true
        }).maxTimeMS(30000);

        res.json({
            success: true,
            data: {
                products,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(total / limit),
                    totalProducts: total
                }
            }
        });
    } catch (error) {
        console.error('❌ Get products by category error:', error);
        
        if (error.name === 'MongooseError' && error.message.includes('buffering timed out')) {
            return res.status(503).json({
                success: false,
                message: 'Database connection timeout. Please try again.',
                error: 'DATABASE_TIMEOUT'
            });
        }
        
        res.status(500).json({
            success: false,
            message: 'Error fetching products by category',
            error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
        });
    }
});

// @route   POST /api/products
// @desc    Create new product (Admin only)
// @access  Private/Admin
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const product = await Product.create(req.body);

        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            data: { product }
        });
    } catch (error) {
        console.error('❌ Create product error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @route   PUT /api/products/:id
// @desc    Update product (Admin only)
// @access  Private/Admin
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product updated successfully',
            data: { product }
        });
    } catch (error) {
        console.error('❌ Update product error:', error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
});

// @route   DELETE /api/products/:id
// @desc    Delete product (Admin only)
// @access  Private/Admin
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );

        if (!product) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        res.json({
            success: true,
            message: 'Product deleted successfully'
        });
    } catch (error) {
        console.error('❌ Delete product error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;