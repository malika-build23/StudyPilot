const multer = require('multer');
const path = require('path');

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB per file
const MAX_FILES = 10; // Up to 10 images/pages per note

const allowedExtensions = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.pdf': 'application/pdf',
};

const cleanNotesUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: MAX_FILES,
  },
  fileFilter: (req, file, callback) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const expectedMime = allowedExtensions[ext];

    if (!expectedMime) {
      return callback(
        new Error(
          `Unsupported file format '${ext}'. Clean Notes Converter supports JPG, JPEG, PNG, and PDF documents.`
        )
      );
    }

    callback(null, true);
  },
});

module.exports = cleanNotesUpload;
