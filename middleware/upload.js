const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/products');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Keep original filename with timestamp prefix to avoid conflicts
    const timestamp = Date.now();
    const originalName = file.originalname;
    cb(null, `${timestamp}-${originalName}`);
  }
});

// File filter to only allow images
const fileFilter = (req, file, cb) => {
  // Check if file is an image
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Middleware for handling multiple product images
const uploadProductImages = upload.fields([
  { name: 'image_1', maxCount: 1 },
  { name: 'image_2', maxCount: 1 },
  { name: 'image_3', maxCount: 1 },
  { name: 'image_4', maxCount: 1 },
  { name: 'image_5', maxCount: 1 },
  { name: 'image_6', maxCount: 1 },
  { name: 'image_7', maxCount: 1 },
  { name: 'image_8', maxCount: 1 }
]);

// Middleware to add file path information
const addFilePathInfo = (req, res, next) => {
  if (req.files) {
    // Add server URL information to each file
    Object.keys(req.files).forEach(fieldName => {
      if (req.files[fieldName] && req.files[fieldName][0]) {
        const file = req.files[fieldName][0];
        // Add server URL to file object
        file.serverUrl = `${req.protocol}://${req.get('host')}/uploads/products/${file.filename}`;
      }
    });
  }
  next();
};

module.exports = {
  uploadProductImages,
  addFilePathInfo
};
