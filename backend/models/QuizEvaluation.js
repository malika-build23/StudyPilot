const mongoose = require('mongoose');

const questionResultSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      default: [],
    },
    selectedAnswer: {
      type: String,
      default: null,
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const topicPerformanceSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    accuracy: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['strong', 'moderate', 'weak', 'insufficient_data'],
      required: true,
    },
  },
  { _id: false }
);

const quizEvaluationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Quiz',
      required: true,
      index: true,
    },
    attemptId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'QuizAttempt',
      required: true,
      unique: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    incorrectAnswers: {
      type: Number,
      required: true,
    },
    unansweredQuestions: {
      type: Number,
      required: true,
      default: 0,
    },
    score: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    questionResults: {
      type: [questionResultSchema],
      default: [],
    },
    topicBreakdown: {
      type: [topicPerformanceSchema],
      default: [],
    },
    weakTopics: {
      type: [String],
      default: [],
    },
    recommendations: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

quizEvaluationSchema.index({ userId: 1, subjectId: 1, createdAt: -1 });

module.exports = mongoose.model('QuizEvaluation', quizEvaluationSchema);
