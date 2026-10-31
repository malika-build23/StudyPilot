const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  getRevisionOverview,
  getCardsDueToday,
  submitCardReview,
  getReviewHistory,
} = require('../controllers/revisionController');

// All routes require authenticated user
router.use(protect);

router.get('/overview', getRevisionOverview);
router.get('/today', getCardsDueToday);
router.post('/:flashcardId/review', submitCardReview);
router.get('/history', getReviewHistory);

module.exports = router;
