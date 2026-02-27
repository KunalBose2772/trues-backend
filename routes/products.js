const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Product = require('../models/Product');

// @route   GET /api/products
// @desc    Get all products for the shop
// @access  Public
router.get('/', async (req, res) => {
    try {
        const products = await Product.find()
            .populate('sellerId', 'username avatar location')
            .sort({ createdAt: -1 });
        res.json(products);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/products
// @desc    Create a new product listing
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { title, price, imageUri, location, category, isFeatured } = req.body;

        const newProduct = new Product({
            sellerId: req.user.id,
            title,
            price,
            imageUri,
            location,
            category,
            isFeatured
        });

        const product = await newProduct.save();
        await product.populate('sellerId', 'username avatar location');

        res.json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
