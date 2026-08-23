const fs = require('fs');
const path = require('path');
const multer = require('multer');

const uploadDir = path.join(__dirname, '../../uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, callback) => callback(null, uploadDir),
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase() || '.jpg';
    callback(null, 'incident-' + Date.now() + '-' + Math.round(Math.random() * 1e9) + extension);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, callback) => {
    if (!file.mimetype.startsWith('image/')) return callback(new Error('Only image files are allowed.'));
    callback(null, true);
  }
});

module.exports = upload;
