const mongoose = require('mongoose');

const flashcardDeckSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Deck must belong to a user'],
      index: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: [true, 'Deck must belong to a subject'],
      index: true,
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyMaterial',
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Deck title is required'],
      trim: true,
      maxlength: [150, 'Title cannot exceed 150 characters'],
    },
    chapter: {
      type: String,
      trim: true,
      default: 'General',
      maxlength: [150, 'Chapter name cannot exceed 150 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    cardCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

flashcardDeckSchema.index({ userId: 1, subjectId: 1, createdAt: -1 });

module.exports = mongoose.model('FlashcardDeck', flashcardDeckSchema);
