const mongoose = require('mongoose');

const extractedExamSchema = new mongoose.Schema(
  {
    subjectName: {
      type: String,
      required: true,
      trim: true,
    },
    subjectCode: {
      type: String,
      trim: true,
      default: '',
    },
    examDate: {
      type: String, // Stored as YYYY-MM-DD
      trim: true,
      default: '',
    },
    day: {
      type: String,
      trim: true,
      default: '',
    },
    startTime: {
      type: String,
      trim: true,
      default: '',
    },
    endTime: {
      type: String,
      trim: true,
      default: '',
    },
    duration: {
      type: String,
      trim: true,
      default: '',
    },
    semester: {
      type: mongoose.Schema.Types.Mixed, // e.g. 3 or "3" or "Semester 3"
      default: '',
    },
    branch: {
      type: String,
      trim: true,
      default: '',
    },
    examType: {
      type: String,
      trim: true,
      default: 'THEORY',
    },
    applicability: {
      type: String,
      enum: ['COMMON', 'BRANCH_SPECIFIC', 'UNCERTAIN', 'OTHER_SEMESTER'],
      default: 'BRANCH_SPECIFIC',
    },
    confidence: {
      type: Number,
      default: 1.0,
      min: 0,
      max: 1,
    },
    sourcePage: {
      type: Number,
      default: 1,
    },
    instructions: {
      type: String,
      trim: true,
      default: '',
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'NEEDS_REVIEW'],
      default: 'PENDING',
    },
    selected: {
      type: Boolean,
      default: true,
    },
  },
  { _id: true }
);

const dateSheetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
      trim: true,
    },
    storagePath: {
      type: String,
      required: true,
    },
    fileUrl: {
      type: String,
      default: null,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    semester: {
      type: String,
      trim: true,
      default: '',
    },
    branch: {
      type: String,
      trim: true,
      default: '',
    },
    extractedExams: {
      type: [extractedExamSchema],
      default: [],
    },
    filteredExams: {
      type: [extractedExamSchema],
      default: [],
    },
    processingStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
      index: true,
    },
    ocrRequired: {
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

dateSheetSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('DateSheet', dateSheetSchema);
