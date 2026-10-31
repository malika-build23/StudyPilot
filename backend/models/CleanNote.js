const mongoose = require('mongoose');

const originalFileSchema = new mongoose.Schema(
  {
    fileName: { type: String, required: true },
    storagePath: { type: String, required: true },
    fileType: { type: String, required: true },
    fileSize: { type: Number, required: true },
  },
  { _id: false }
);

const cleanNoteSchema = new mongoose.Schema(
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
      index: true,
    },
    materialId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudyMaterial',
      default: null,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    chapter: {
      type: String,
      trim: true,
      default: '',
      maxlength: [150, 'Chapter cannot exceed 150 characters'],
    },
    originalFiles: [originalFileSchema],
    extractedText: {
      type: String,
      default: '', // Raw OCR output
    },
    structuredContent: {
      type: mongoose.Schema.Types.Mixed,
      default: null, // AI-structured output (headings, definitions, formulas, key points, etc.)
    },
    editedContent: {
      type: mongoose.Schema.Types.Mixed,
      default: null, // Student-customized content
    },
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

cleanNoteSchema.index({ userId: 1, subjectId: 1, createdAt: -1 });

module.exports = mongoose.model('CleanNote', cleanNoteSchema);
