const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../uploads/vendor-documents');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Create filename with vendor ID and document type
    const vendorId = req.user.id;
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const documentType = file.fieldname; // business_license, gst_certificate, cancelled_cheque
    cb(null, `vendor_${vendorId}_${documentType}_${timestamp}${ext}`);
  }
});

// File filter to allow documents (PDF, images)
const fileFilter = (req, file, cb) => {
  // Allow PDF and image files
  const allowedMimes = [
    'application/pdf',
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/gif'
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and image files (JPEG, PNG, GIF) are allowed!'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for documents
  }
});

// Middleware for handling vendor document uploads
const uploadVendorDocuments = upload.fields([
  { name: 'business_license', maxCount: 1 },
  { name: 'gst_certificate', maxCount: 1 },
  { name: 'cancelled_cheque', maxCount: 1 }
]);

// Middleware to add file path information
const addDocumentPathInfo = (req, res, next) => {
  if (req.files) {
    // Add server URL information to each file
    Object.keys(req.files).forEach(fieldName => {
      if (req.files[fieldName] && req.files[fieldName][0]) {
        const file = req.files[fieldName][0];
        // Add server URL to file object
        file.serverUrl = `${req.protocol}://${req.get('host')}/uploads/vendor-documents/${file.filename}`;
      }
    });
  }
  next();
};

// Single document upload middleware
const uploadSingleDocument = (documentType) => {
  return upload.single(documentType);
};

module.exports = {
  uploadVendorDocuments,
  addDocumentPathInfo,
  uploadSingleDocument
};
