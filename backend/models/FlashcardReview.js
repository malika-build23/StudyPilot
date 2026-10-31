const mongoose = require('mongoose');

const reviewAttemptSchema = new mongoose.Schema(
  {
    rating: {
      type: String,
      enum: ['again', 'hard', 'easy'],
      required: true,
    },
    reviewedAt: {
      type: Date,
      default: Date.now,
    },
    intervalBefore: {
      type: Number,
      default: 0,
    },
    intervalAfter: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const flashcardReviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    flashcardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Flashcard',
      required: true,
      index: true,
    },
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FlashcardDeck',
      required: true,
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
      index: true,
    },
    lastReviewedAt: {
      type: Date,
      default: null,
    },
    nextReviewAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    interval: {
      type: Number, // interval in days (fractions for sub-day, e.g., 10 / 1440 for 10 min)
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    correctCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    incorrectCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    easeFactor: {
      type: Number,
      default: 2.5,
      min: 1.3,
      max: 3.5,
    },
    consecutiveCorrect: {
      type: Number,
      default: 0,
      min: 0,
    },
    reviewHistory: [reviewAttemptSchema],
  },
  {
    timestamps: true,
  }
);

// Enforce strictly one review state per user and flashcard!
flashcardReviewSchema.index({ userId: 1, flashcardId: 1 }, { unique: true });
flashcardReviewSchema.index({ userId: 1, nextReviewAt: 1 });
flashcardReviewSchema.index({ userId: 1, subjectId: 1, nextReviewAt: 1 });

module.exports = mongoose.model('FlashcardReview', flashcardReviewSchema);
