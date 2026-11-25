const multer = require('multer');
const path = require('path');
const fs = require('fs');
const os = require('os');

const localUploadDir = path.resolve(__dirname, '../../uploads');
const tmpUploadDir = path.join(os.tmpdir(), 'mahalaxmi-uploads');

function resolveUploadDir() {
  if (process.env.VERCEL) {
    if (!fs.existsSync(tmpUploadDir)) {
      fs.mkdirSync(tmpUploadDir, { recursive: true });
    }
    return tmpUploadDir;
  }

  try {
    if (!fs.existsSync(localUploadDir)) {
      fs.mkdirSync(localUploadDir, { recursive: true });
    }
    fs.accessSync(localUploadDir, fs.constants.W_OK);
    return localUploadDir;
  } catch (err) {
    if (!fs.existsSync(tmpUploadDir)) {
      fs.mkdirSync(tmpUploadDir, { recursive: true });
    }
    return tmpUploadDir;
  }
}

const uploadDir = resolveUploadDir();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, resolveUploadDir());
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const allowedExts = ['.jpg', '.jpeg', '.png', '.webp', '.svg'];
    const rawExt = path.extname(file.originalname || '').toLowerCase();
    const ext = allowedExts.includes(rawExt) ? rawExt : '.jpg';
    cb(null, 'mn-' + uniqueSuffix + ext);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const err = new Error('Invalid image file format. Only JPEG, PNG, WEBP, and SVG are supported.');
    err.status = 400;
    cb(err, false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit (browser-image-compression handles client side < 200KB)
  },
  fileFilter
});

module.exports = upload;
module.exports.uploadDir = uploadDir;
module.exports.localUploadDir = localUploadDir;
module.exports.tmpUploadDir = tmpUploadDir;
