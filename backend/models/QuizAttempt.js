const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
    },
    selectedAnswer: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const quizAttemptSchema = new mongoose.Schema(
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
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
    status: {
      type: String,
      enum: ['submitted'],
      default: 'submitted',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

quizAttemptSchema.index({ userId: 1, quizId: 1, createdAt: -1 });

module.exports = mongoose.model('QuizAttempt', quizAttemptSchema);