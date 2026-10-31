const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');

const {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  getUniversityExams,
  createUniversityExam,
  getPracticalExams,
  createPracticalExam,
  updatePracticalExam,
  deletePracticalExam,
  getExamsOverview,
  getUpcomingExams,
  getCalendarExams,
  getCompletedExams,
} = require('../controllers/examController');

// All exam routes require JWT auth
router.use(protect);

// Dashboard, Overview, and Calendar routes (must precede /:id)
router.get('/overview', getExamsOverview);
router.get('/upcoming', getUpcomingExams);
router.get('/calendar', getCalendarExams);
router.get('/completed', getCompletedExams);

// University Theory examination routes
router.route('/university')
  .get(getUniversityExams)
  .post(createUniversityExam);

// Practical & Internal examination routes
router.route('/practical')
  .get(getPracticalExams)
  .post(createPracticalExam);

router.route('/practical/:id')
  .put(updatePracticalExam)
  .delete(deletePracticalExam);

// General Exam CRUD routes
router.route('/')
  .post(createExam)
  .get(getExams);

router.route('/:id')
  .get(getExamById)
  .put(updateExam)
  .delete(deleteExam);

module.exports = router;
