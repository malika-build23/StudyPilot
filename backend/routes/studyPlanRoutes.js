const express = require('express');
const router = express.Router();

const { protect } = require('../middleware/auth');

const {
  generatePlan,
  getPlanByExam,
  updateTaskStatus,
  regeneratePlan,
  adjustPlan,
  toggleTaskLock,
  updatePlanPreferences,
  getAdjustmentHistory,
} = require('../controllers/studyPlanController');

router.use(protect);

router.post('/generate', generatePlan);
router.get('/:examId', getPlanByExam);
router.patch('/:planId/tasks/:taskId', updateTaskStatus);
router.post('/:planId/regenerate', regeneratePlan);

// Phase 6 Part B: Automatic Study Plan Adjustment Endpoints
router.post('/:planId/adjust', adjustPlan);
router.patch('/:planId/tasks/:taskId/lock', toggleTaskLock);
router.patch('/:planId/preferences', updatePlanPreferences);
router.get('/:planId/history', getAdjustmentHistory);

module.exports = router;