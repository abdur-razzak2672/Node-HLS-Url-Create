// routes/upload.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { convertToHLS } = require('../services/ffmpegService');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads');
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

 router.post('/upload', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const videoPath = req.file.path;
    await convertToHLS(videoPath);
    res.json({ message: 'Video uploaded and converted to HLS successfully!' });
  } catch (error) {
    console.error('Error processing video:', error);
    res.status(500).json({ error: 'An error occurred while processing the video' });
  }
});

module.exports = router;
