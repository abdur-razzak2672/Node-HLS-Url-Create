require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const HLS = require('hls-server');

const app = express();

// Middleware for parsing JSON and urlencoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for HTML player and video files)
app.use(express.static(path.join(__dirname, 'public')));

// Serve HLS videos
app.use('/videos', express.static(path.join(__dirname, 'services/videos')));

// Routes
const uploadRouter = require('./routes/upload');
app.use('/api', uploadRouter);

// Serve HLS streams
new HLS(app, {
  provider: {
    exists: (req, cb) => {
      const ext = req.url.split('.').pop();
      if (ext !== 'm3u8' && ext !== 'ts') {
        return cb(null, true);
      }

      fs.access(path.join(__dirname, 'services/videos', req.url), fs.constants.F_OK, function (err) {
        if (err) {
          console.log('File does not exist', req.url);
          return cb(null, false);
        }
        cb(null, true);
      });
    },
    getManifestStream: (req, cb) => {
      const stream = fs.createReadStream(path.join(__dirname, 'services/videos', req.url));
      cb(null, stream);
    },
    getSegmentStream: (req, cb) => {
      const stream = fs.createReadStream(path.join(__dirname, 'services/videos', req.url));
      cb(null, stream);
    }
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
