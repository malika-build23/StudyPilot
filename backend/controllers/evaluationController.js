const QuizAttempt = require('../models/QuizAttempt');
const Quiz = require('../models/Quiz');
const QuizEvaluation = require('../models/QuizEvaluation');
const { evaluateQuizAttempt } = require('../services/evaluationService');

const getUserId = (req) => req.user._id;

// @desc    Evaluate a submitted quiz attempt (idempotent: returns existing evaluation if already evaluated)
// @route   POST /api/attempts/:attemptId/evaluate
// @access  Private
const evaluateAttempt = async (req, res, next) => {
  try {
    const { attemptId } = req.params;

    if (!attemptId) {
      return res.status(400).json({
        success: false,
        message: 'Attempt ID is required.',
      });
    }

    // Verify attempt ownership and retrieve attempt
    const attempt = await QuizAttempt.findOne({
      _id: attemptId,
      userId: getUserId(req),
    });

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: 'Quiz attempt not found or you do not have permission to access it.',
      });
    }

    if (attempt.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: `Quiz attempt status is "${attempt.status}". Only submitted attempts can be evaluated.`,
      });
    }

    // Prevent duplicate evaluations (idempotent lookup)
    const existingEvaluation = await QuizEvaluation.findOne({
      attemptId: attempt._id,
      userId: getUserId(req),
    }).populate('quizId', 'title difficulty');

    if (existingEvaluation) {
      return res.status(200).json({
        success: true,
        message: 'Attempt evaluation already exists.',
        data: existingEvaluation,
      });
    }

    // Retrieve corresponding quiz with answer keys
    const quiz = await Quiz.findOne({
      _id: attempt.quizId,
      userId: getUserId(req),
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Corresponding quiz not found.',
      });
    }

    // Perform deterministic evaluation
    const evaluationData = evaluateQuizAttempt(attempt, quiz);

    // Save evaluation record to MongoDB
    const evaluation = await QuizEvaluation.create({
      userId: getUserId(req),
      quizId: quiz._id,
      attemptId: attempt._id,
      subjectId: quiz.subjectId,
      ...evaluationData,
    });

    // Populate quiz details for immediate display
    await evaluation.populate('quizId', 'title difficulty');

    return res.status(201).json({
      success: true,
      message: 'Quiz attempt evaluated successfully.',
      data: evaluation,
    });
  } catch (error) {
    // If a race condition caused a duplicate attemptId key error (E11000)
    if (error.code === 11000) {
      const existing = await QuizEvaluation.findOne({
        attemptId: req.params.attemptId,
        userId: getUserId(req),
      }).populate('quizId', 'title difficulty');

      if (existing) {
        return res.status(200).json({
          success: true,
          message: 'Attempt evaluation already exists.',
          data: existing,
        });
      }
    }
    next(error);
  }
};

// @desc    Retrieve saved evaluation and mistake analysis for an attempt
// @route   GET /api/attempts/:attemptId/result
// @access  Private
const getAttemptResult = async (req, res, next) => {
  try {
    const { attemptId } = req.params;

    const evaluation = await QuizEvaluation.findOne({
      attemptId,
      userId: getUserId(req),
    })
      .populate('quizId', 'title difficulty')
      .populate('subjectId', 'subjectName semester');

    if (!evaluation) {
      return res.status(404).json({
        success: false,
        message: 'Evaluation result not found for this attempt.',
      });
    }

    // Group mistakes by topic
    const mistakes = evaluation.questionResults.filter((q) => !q.isCorrect);
    const mistakesByTopicMap = new Map();

    mistakes.forEach((m) => {
      const t = m.topic;
      if (!mistakesByTopicMap.has(t)) {
        mistakesByTopicMap.set(t, []);
      }
      mistakesByTopicMap.get(t).push(m);
    });

    const mistakesByTopic = [];
    mistakesByTopicMap.forEach((items, topic) => {
      mistakesByTopic.push({
        topic,
        count: items.length,
        items,
      });
    });

    return res.status(200).json({
      success: true,
      data: {
        ...evaluation.toObject(),
        mistakes,
        mistakeCount: mistakes.length,
        mistakesByTopic,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  evaluateAttempt,
  getAttemptResult,
};
