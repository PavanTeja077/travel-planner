const express = require('express');
const router = express.Router();
const { upload } = require('../utils/cloudinary');

// @route   POST /api/upload
// @desc    Upload a document to Cloudinary
// @access  Public (for now)
router.post('/', upload.single('document'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }
    
    // req.file contains information about the uploaded file
    res.status(200).json({
      message: 'File uploaded successfully',
      url: `http://localhost:5000/uploads/${req.file.filename}`,
      name: req.file.originalname,
      size: req.file.size
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error during upload' });
  }
});

module.exports = router;
