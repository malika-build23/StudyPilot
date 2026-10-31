const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');

const {
  generatePlan,
  getPlanByExam,
  updateTaskStatus,
  regeneratePlan,
} = require('../controllers/studyPlanController');

router.use(protect);

router.post('/generate', generatePlan);
router.get('/:examId', getPlanByExam);
router.patch('/:planId/tasks/:taskId', updateTaskStatus);
router.post('/:planId/regenerate', regeneratePlan);

module.exports = router;