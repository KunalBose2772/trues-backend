const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');

// Set storage engine for Multer
const storage = multer.diskStorage({
    destination: './uploads/',
    filename: function (req, file, cb) {
        // Create unique filenames, e.g., image-163234234.jpg
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});

// Initialize Multer upload
const upload = multer({
    storage: storage,
    limits: { fileSize: 10000000 }, // 10MB limit
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

// Check File Type helper
function checkFileType(file, cb) {
    // Allowed extensions
    const filetypes = /jpeg|jpg|png|gif|webp/;
    // Check extension
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    // Check mime type
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true);
    } else {
        cb('Error: Images Only!');
    }
}

// @route   POST /api/upload
// @desc    Upload an image file
// @access  Private
// The name 'image' must match exactly the field name from the mobile app's FormData
router.post('/', protect, upload.single('image'), (req, res) => {
    if (req.file == undefined) {
        return res.status(400).json({ message: 'No file selected' });
    }

    // Return the URL where the image is now accessible on our server
    res.json({
        message: 'File uploaded successfully',
        filePath: `/uploads/${req.file.filename}`
    });
});

module.exports = router;
