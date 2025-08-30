const express = require('express');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/cart
// @desc    Get user's cart
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user.id })
            .populate('items.product', 'name price images stock isActive');

        if (!cart) {
            cart = await Cart.create({
                user: req.user.id,
                items: []
            });
        }

        // Filter out inactive products
        cart.items = cart.items.filter(item => 
            item.product && item.product.isActive
        );

        // Recalculate total
        cart.total = cart.items.reduce((total, item) => {
            return total + (item.price * item.quantity);
        }, 0);

        await cart.save();

        res.json({
            success: true,
            data: { cart }
        });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   POST /api/cart/add
// @desc    Add item to cart
// @access  Private
router.post('/add', protect, async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        // Validate product
        const product = await Product.findById(productId);
        if (!product || !product.isActive) {
            return res.status(404).json({
                success: false,
                message: 'Product not found'
            });
        }

        // Check stock
        if (product.stock < quantity) {
            return res.status(400).json({
                success: false,
                message: `Only ${product.stock} items available in stock`
            });
        }

        // Get or create cart
        let cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            cart = await Cart.create({
                user: req.user.id,
                items: []
            });
        }

        // Check if item already exists in cart
        const existingItemIndex = cart.items.findIndex(
            item => item.product.toString() === productId
        );

        if (existingItemIndex >= 0) {
            // Update quantity
            const newQuantity = cart.items[existingItemIndex].quantity + quantity;
            
            if (newQuantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Cannot add more items. Only ${product.stock} available in stock`
                });
            }
            
            cart.items[existingItemIndex].quantity = newQuantity;
        } else {
            // Add new item
            cart.items.push({
                product: productId,
                quantity,
                price: product.price
            });
        }

        await cart.save();

        // Populate cart items for response
        await cart.populate('items.product', 'name price images stock isActive');

        res.json({
            success: true,
            message: 'Item added to cart',
            data: { cart }
        });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   PUT /api/cart/update
// @desc    Update item quantity in cart
// @access  Private
router.put('/update', protect, async (req, res) => {
    try {
        const { productId, quantity } = req.body;

        if (quantity < 0) {
            return res.status(400).json({
                success: false,
                message: 'Quantity cannot be negative'
            });
        }

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        if (quantity === 0) {
            // Remove item
            cart.items = cart.items.filter(
                item => item.product.toString() !== productId
            );
        } else {
            // Update quantity
            const itemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (itemIndex === -1) {
                return res.status(404).json({
                    success: false,
                    message: 'Item not found in cart'
                });
            }

            // Check stock
            const product = await Product.findById(productId);
            if (quantity > product.stock) {
                return res.status(400).json({
                    success: false,
                    message: `Only ${product.stock} items available in stock`
                });
            }

            cart.items[itemIndex].quantity = quantity;
        }

        await cart.save();
        await cart.populate('items.product', 'name price images stock isActive');

        res.json({
            success: true,
            message: 'Cart updated successfully',
            data: { cart }
        });
    } catch (error) {
        console.error('Update cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/cart/remove/:productId
// @desc    Remove item from cart
// @access  Private
router.delete('/remove/:productId', protect, async (req, res) => {
    try {
        const { productId } = req.params;

        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = cart.items.filter(
            item => item.product.toString() !== productId
        );

        await cart.save();
        await cart.populate('items.product', 'name price images stock isActive');

        res.json({
            success: true,
            message: 'Item removed from cart',
            data: { cart }
        });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

// @route   DELETE /api/cart/clear
// @desc    Clear cart
// @access  Private
router.delete('/clear', protect, async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.user.id });
        if (!cart) {
            return res.status(404).json({
                success: false,
                message: 'Cart not found'
            });
        }

        cart.items = [];
        cart.total = 0;
        await cart.save();

        res.json({
            success: true,
            message: 'Cart cleared successfully',
            data: { cart }
        });
    } catch (error) {
        console.error('Clear cart error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
});

module.exports = router;