
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const upload = require('../middleware/uploadMiddleware');

const {
  uploadMaterial,
  getMaterialsBySubject,
  getMaterialById,
  deleteMaterial,
} = require('../controllers/materialController');

router.use(protect);

router.post('/upload', upload.single('file'), uploadMaterial);
router.get('/:subjectId', getMaterialsBySubject);
router.get('/file/:id', getMaterialById);
router.delete('/:id', deleteMaterial);

module.exports = router;
