const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const {
  evaluateAttempt,
  getAttemptResult,
} = require('../controllers/evaluationController');

// All attempt evaluation routes require authentication
router.use(protect);

// Evaluate a submitted attempt
router.post('/:attemptId/evaluate', evaluateAttempt);

// Get attempt evaluation results & mistake breakdown
router.get('/:attemptId/result', getAttemptResult);

module.exports = router;
