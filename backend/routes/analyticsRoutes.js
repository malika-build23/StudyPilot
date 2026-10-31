const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');
const {
  getOverviewAnalytics,
  getWeakTopics,
  getSubjectAnalytics,
} = require('../controllers/analyticsController');

// All analytics routes require authentication
router.use(protect);

// Global overview analytics across all subjects
router.get('/overview', getOverviewAnalytics);

// Global weak topics & recommendations
router.get('/weak-topics', getWeakTopics);

// Subject-specific analytics (parameterized route placed after fixed endpoints)
router.get('/:subjectId', getSubjectAnalytics);

module.exports = router;
