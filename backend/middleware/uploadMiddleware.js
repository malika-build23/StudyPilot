
const multer = require('multer');
const path = require('path');

const MAX_FILE_SIZE = 25 * 1024 * 1024;

const allowedTypes = {
  '.pdf': 'application/pdf',
  '.pptx':
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
};

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1,
  },
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const expectedMimeType = allowedTypes[extension];

    if (!expectedMimeType || file.mimetype !== expectedMimeType) {
      return callback(
        new Error('Only PDF and PPTX files are currently supported.')
      );
    }

    callback(null, true);
  },
});

module.exports = upload;
