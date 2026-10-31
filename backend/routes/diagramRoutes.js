
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');

const {
  generateDiagramContent,
  saveDiagram,
  getDiagrams,
  getDiagramById,
  deleteDiagram,
} = require('../controllers/diagramController');

router.use(protect);

router.post('/generate', generateDiagramContent);
router.post('/', saveDiagram);
router.get('/', getDiagrams);
router.get('/:id', getDiagramById);
router.delete('/:id', deleteDiagram);

module.exports = router;
