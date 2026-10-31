const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const cleanNotesUpload = require('../middleware/cleanNotesUploadMiddleware');
const {
  uploadAndProcessNotes,
  getNotes,
  getNoteById,
  updateNote,
  processNote,
  exportNote,
  deleteNote,
} = require('../controllers/cleanNotesController');

// All routes require authenticated user
router.use(protect);

router.post('/upload', cleanNotesUpload.array('files', 10), uploadAndProcessNotes);
router.get('/', getNotes);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.post('/:id/process', processNote);
router.get('/:id/export', exportNote);
router.delete('/:id', deleteNote);

module.exports = router;
