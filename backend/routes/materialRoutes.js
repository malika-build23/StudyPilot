const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');
const Subject = require('../models/Subject');
const StudyMaterial = require('../models/StudyMaterial');

const {
  uploadMaterial,
  getMaterialsBySubject,
  getMaterialById,
  deleteMaterial,
} = require('../controllers/materialController');

// All material routes require authentication
router.use(protect);

// Upload endpoint
router.post('/upload', upload.single('file'), uploadMaterial);

// Explicit routes
router.get('/subject/:subjectId', getMaterialsBySubject);
router.get('/file/:id', getMaterialById);

// Dynamic root parameter route supporting both GET /:materialId and GET /:subjectId
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    // Check if the parameter matches a Subject belonging to the user
    const isSubject = await Subject.exists({ _id: id, userId: req.user._id });
    if (isSubject) {
      req.params.subjectId = id;
      return getMaterialsBySubject(req, res, next);
    }
    // Otherwise treat as StudyMaterial ID
    return getMaterialById(req, res, next);
  } catch (err) {
    next(err);
  }
});

// Delete endpoint
router.delete('/:id', deleteMaterial);

module.exports = router;
