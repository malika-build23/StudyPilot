
const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');

const {
  generateQuiz,
  getQuizById,
  getQuizzesBySubject,
  submitQuiz,
} = require('../controllers/quizController');

// All quiz routes require authentication
router.use(protect);

// Generate a quiz
router.post('/generate', generateQuiz);

// Get all quizzes for a subject
router.get('/subject/:subjectId', getQuizzesBySubject);

// Submit quiz answers
router.post('/:id/submit', submitQuiz);

// Get a specific quiz
router.get('/:id', getQuizById);

module.exports = router;
