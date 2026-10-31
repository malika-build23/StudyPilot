const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  analyseDocument,
  getAnalysis,
  askQuestion,
} = require('../controllers/aiController');

// All AI routes require user authentication
router.use(protect);

router.post('/materials/:id/analyse', analyseDocument);
router.get('/materials/:id/analysis', getAnalysis);
router.post('/materials/:id/ask', askQuestion);

module.exports = router;
//prrr
