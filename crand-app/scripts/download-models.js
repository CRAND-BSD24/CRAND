const https = require('https');
const fs = require('fs');
const path = require('path');

const models = [
  {
    name: 'ssd_mobilenetv1_model',
    files: [
      'ssd_mobilenetv1_model-weights_manifest.json',
      'ssd_mobilenetv1_model.bin',
    ]
  },
  {
    name: 'face_landmark_68_model',
    files: [
      'face_landmark_68_model-weights_manifest.json',
      'face_landmark_68_model.bin',
    ]
  },
  {
    name: 'face_recognition_model',
    files: [
      'face_recognition_model-weights_manifest.json',
      'face_recognition_model.bin',
    ]
  }
];

// Use stable CDN for @vladmandic/face-api model files
const baseUrl = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
const modelsDir = path.join(__dirname, '../public/models');

if (!fs.existsSync(modelsDir)) {
  fs.mkdirSync(modelsDir, { recursive: true });
}

async function downloadFile(url, filepath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filepath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.close(() => {});
        fs.unlink(filepath, () => {});
        return reject(new Error(`HTTP ${response.statusCode} for ${url}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filepath, () => {});
      reject(err);
    });
  });
}

async function downloadModels() {
  for (const model of models) {
    for (const file of model.files) {
      const url = `${baseUrl}${file}`;
      const filepath = path.join(modelsDir, file);
      console.log(`Downloading ${file}...`);
      try {
        await downloadFile(url, filepath);
        console.log(`Downloaded ${file}`);
      } catch (err) {
        console.error(`Error downloading ${file}:`, err);
      }
    }
  }
}

downloadModels().then(() => {
  console.log('All models downloaded successfully!');
}).catch(err => {
  console.error('Error downloading models:', err);
});