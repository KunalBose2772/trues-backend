const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper to generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        user = await User.create({
            username,
            email,
            password
        });

        res.status(201).json({
            _id: user.id,
            username: user.username,
            email: user.email,
            avatar: user.avatar,
            bio: user.bio,
            followers: user.followers.length,
            following: user.following.length,
            token: generateToken(user.id)
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                followers: user.followers.length,
                following: user.following.length,
                token: generateToken(user.id)
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/auth/google
// @desc    Authenticate user via Google
// @access  Public
router.post('/google', async (req, res) => {
    // Note: In production, verify the Google Token ID securely using google-auth-library
    // For now, assume the frontend verified the Google Sign-In and sends email/name/picture
    const { email, name, picture, googleId } = req.body;

    try {
        let user = await User.findOne({ email });

        if (user) {
            // User exists, log them in
            res.json({
                _id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                followers: user.followers.length,
                following: user.following.length,
                token: generateToken(user.id)
            });
        } else {
            // Create a new user for Google Sign-In
            // We give them a random secure password since they login with Google
            const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);

            user = await User.create({
                username: name,
                email,
                password: randomPassword,
                avatar: picture,
                googleId
            });

            res.status(201).json({
                _id: user.id,
                username: user.username,
                email: user.email,
                avatar: user.avatar,
                bio: user.bio,
                followers: user.followers.length,
                following: user.following.length,
                token: generateToken(user.id)
            });
        }
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
