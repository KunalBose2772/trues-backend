const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    imageUri: {
        type: String,
        required: true
    },
    location: {
        type: String,
        default: 'Online'
    },
    isFeatured: {
        type: Boolean,
        default: false
    },
    category: {
        type: String,
        default: 'General'
    }
}, { timestamps: true });

module.exports = mongoose.model('Product', ProductSchema);
