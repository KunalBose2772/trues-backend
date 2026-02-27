const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const Chat = require('../models/Chat');
const User = require('../models/User');

// @route   GET /api/chats
// @desc    Get user's chat conversations
// @access  Private
router.get('/', protect, async (req, res) => {
    try {
        const chats = await Chat.find({ participants: req.user.id })
            .populate('participants', 'username avatar')
            .sort({ updatedAt: -1 });

        res.json(chats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/chats
// @desc    Send a message (creates a chat if it doesn't exist)
// @access  Private
router.post('/', protect, async (req, res) => {
    try {
        const { receiverId, text, imageUrl } = req.body;

        if (receiverId === req.user.id) {
            return res.status(400).json({ msg: "Cannot message yourself" });
        }

        // Check if chat already exists between these two users
        let chat = await Chat.findOne({
            participants: { $all: [req.user.id, receiverId] }
        });

        const newMessage = {
            senderId: req.user.id,
            text,
            imageUrl
        };

        if (chat) {
            // Chat exists, push new message
            chat.messages.push(newMessage);
            chat.updatedAt = Date.now();
            await chat.save();
        } else {
            // Create a new chat
            chat = new Chat({
                participants: [req.user.id, receiverId],
                messages: [newMessage]
            });
            await chat.save();
        }

        await chat.populate('participants', 'username avatar');

        res.json(chat);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
