const mongoose = require('mongoose');

const quizQuestionSchema = new mongoose.Schema(
  {
    questionId: {
      type: String,
      required: true,
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (options) =>
          options.length === 4 &&
          options.every((option) => typeof option === 'string' && option.trim()),
        message: 'Every question must have exactly four non-empty options.',
      },
    },
    correctAnswer: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyMaterial',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      required: true,
    },
    questions: {
      type: [quizQuestionSchema],
      required: true,
      validate: {
        validator: (questions) => {
          const ids = questions.map((question) => question.questionId);
          return questions.length > 0 && new Set(ids).size === ids.length;
        },
        message: 'Quiz must contain questions with unique IDs.',
      },
    },
  },
  {
    timestamps: true,
  }
);

quizSchema.index({ userId: 1, subjectId: 1, createdAt: -1 });

module.exports = mongoose.model('Quiz', quizSchema);