const mongoose = require('mongoose');

const flashcardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Flashcard must belong to a user'],
      index: true,
    },
    deckId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'FlashcardDeck',
      required: [true, 'Flashcard must belong to a deck'],
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Flashcard must belong to a subject'],
      index: true,
    },
    question: {
      type: String,
      required: [true, 'Question is required'],
      trim: true,
      maxlength: [2000, 'Question cannot exceed 2000 characters'],
    },
    answer: {
      type: String,
      required: [true, 'Answer is required'],
      trim: true,
      maxlength: [3000, 'Answer cannot exceed 3000 characters'],
    },
    explanation: {
      type: String,
      trim: true,
      default: '',
      maxlength: [3000, 'Explanation cannot exceed 3000 characters'],
    },
    difficulty: {
      type: String,
      enum: ['EASY', 'MEDIUM', 'HARD'],
      default: 'MEDIUM',
    },
    chapter: {
      type: String,
      trim: true,
      default: '',
      maxlength: [150, 'Chapter cannot exceed 150 characters'],
    },
    topic: {
      type: String,
      trim: true,
      default: '',
      maxlength: [150, 'Topic cannot exceed 150 characters'],
    },
    sourceReference: {
      type: String,
      trim: true,
      default: '',
      maxlength: [200, 'Source reference cannot exceed 200 characters'],
    },
  },
  {
    timestamps: true,
  }
);

flashcardSchema.index({ deckId: 1, createdAt: 1 });
flashcardSchema.index({ userId: 1, subjectId: 1 });

module.exports = mongoose.model('Flashcard', flashcardSchema);
