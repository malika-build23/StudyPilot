
const mongoose = require('mongoose');

const mnemonicSchema = new mongoose.Schema(
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
      default: null,
    },
    topic: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    technique: {
      type: String,
      required: true,
      enum: [
        'acronym',
        'acrostic',
        'rhyme',
        'first-letter-association',
        'word-association',
        'memory-story',
        'formula-trick',
        'step-by-step',
      ],
    },
    mnemonic: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
    letterMapping: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    originalConcept: {
      type: String,
      required: true,
    },
    example: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

mnemonicSchema.index({ userId: 1, subjectId: 1, createdAt: -1 });
mnemonicSchema.index({ userId: 1, topic: 1 });

module.exports = mongoose.model('Mnemonic', mnemonicSchema);
