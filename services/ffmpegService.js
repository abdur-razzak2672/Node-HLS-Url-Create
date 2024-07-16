const ffmpeg = require('fluent-ffmpeg');
const ffmpegInstaller = require('@ffmpeg-installer/ffmpeg');
const path = require('path');
const fs = require('fs');

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

const convertToHLS = (filePath) => {
  return new Promise((resolve, reject) => {
    const outputDir = path.join(__dirname, '../services/videos', path.basename(filePath, path.extname(filePath)));
    
     if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    ffmpeg(filePath, { timeout: 432000 })
      .addOptions([
        '-profile:v baseline',  
        '-level 3.0',
        '-s 640x360',  
        '-start_number 0',
        '-hls_time 10', 
        '-hls_list_size 0',
        '-f hls'
      ])
      .output(path.join(outputDir, 'index.m3u8'))
      .on('end', () => {
        console.log('HLS conversion finished');
        resolve();
      })
      .on('error', (err) => {
        console.error('Error converting video to HLS', err);
        reject(err);
      })
      .run();
  });
};

module.exports = {
  convertToHLS
};
