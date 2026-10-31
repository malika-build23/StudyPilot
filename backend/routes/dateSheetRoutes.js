const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middleware/auth');

const {
  uploadDateSheet,
  analyzeDateSheetById,
  getDateSheet,
  filterDateSheet,
  confirmDateSheet,
  getDateSheets,
} = require('../controllers/dateSheetController');

// Multer upload middleware configured specifically for PDF date sheets
const dateSheetUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 25 * 1024 * 1024, // 25MB
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.pdf' || file.mimetype !== 'application/pdf') {
      return cb(new Error('Invalid file format. Only official PDF (.pdf) documents are accepted.'));
    }
    cb(null, true);
  },
});

// Protect all date sheet routes with JWT auth
router.use(protect);

router.post('/upload', dateSheetUpload.single('file'), uploadDateSheet);
router.get('/', getDateSheets);
router.get('/:id', getDateSheet);
router.post('/:id/analyze', analyzeDateSheetById);
router.post('/:id/filter', filterDateSheet);
router.post('/:id/confirm', confirmDateSheet);

module.exports = router;
