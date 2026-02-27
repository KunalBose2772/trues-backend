const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Post = require('../models/Post');

// @route   GET /api/posts
// @desc    Get all posts for the feed
// @access  Public (or Private depending on preference, let's say public for now)
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('userId', 'username avatar')
            .populate('attachedProductId')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/posts
// @desc    Create a new post
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const newPost = new Post({
            userId: req.user.id,
            imageUri: req.body.imageUri,
            caption: req.body.caption,
            attachedProductId: req.body.attachedProductId
        });

        const post = await newPost.save();
        await post.populate('userId', 'username avatar');

        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/posts/:id/like
// @desc    Like or Unlike a post
// @access  Private
router.put('/:id/like', protect, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // Check if the post has already been liked by this user
        // Using string comparison because of ObjectId types
        if (post.likedBy.filter(like => like.toString() === req.user.id).length > 0) {
            // Un-like: remove user from likedBy array
            post.likedBy = post.likedBy.filter(like => like.toString() !== req.user.id);
        } else {
            // Like: push user to likedBy array
            post.likedBy.push(req.user.id);
        }

        await post.save();
        res.json(post.likedBy);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
