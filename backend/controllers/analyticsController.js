const QuizEvaluation = require('../models/QuizEvaluation');
const Subject = require('../models/Subject');
const {
  calculatePerformanceAnalytics,
  computeMultiAttemptWeakTopics,
} = require('../services/evaluationService');

const getUserId = (req) => req.user._id;

// @desc    Retrieve overall student performance analytics across all subjects
// @route   GET /api/analytics/overview
// @access  Private
const getOverviewAnalytics = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const [evaluations, subjects] = await Promise.all([
      QuizEvaluation.find({ userId })
        .populate('quizId', 'title difficulty')
        .sort({ createdAt: 1 }),
      Subject.find({ userId }).select('_id subjectName semester'),
    ]);

    const analytics = calculatePerformanceAnalytics(evaluations, subjects);

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Retrieve weak topics and recommendations across all subjects
// @route   GET /api/analytics/weak-topics
// @access  Private
const getWeakTopics = async (req, res, next) => {
  try {
    const userId = getUserId(req);

    const evaluations = await QuizEvaluation.find({ userId });
    const diagnostics = computeMultiAttemptWeakTopics(evaluations);

    return res.status(200).json({
      success: true,
      data: diagnostics,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Retrieve performance analytics for a specific subject
// @route   GET /api/analytics/:subjectId
// @access  Private
const getSubjectAnalytics = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const userId = getUserId(req);

    const subject = await Subject.findOne({
      _id: subjectId,
      userId,
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found or you do not have permission to view it.',
      });
    }

    const evaluations = await QuizEvaluation.find({
      subjectId: subject._id,
      userId,
    })
      .populate('quizId', 'title difficulty')
      .sort({ createdAt: 1 });

    const analytics = calculatePerformanceAnalytics(evaluations, [subject]);

    return res.status(200).json({
      success: true,
      subject: {
        _id: subject._id,
        subjectName: subject.subjectName,
        semester: subject.semester,
      },
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getOverviewAnalytics,
  getWeakTopics,
  getSubjectAnalytics,
};
