// backend/src/api/middlewares/upload.js
// Configures Multer for handling image uploads.

const multer = require('multer');

// Store files in memory as Buffer objects
const storage = multer.memoryStorage();

// Filter to only accept image files
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5, // 5 MB file size limit
  },
  fileFilter: fileFilter,
});

module.exports = upload;