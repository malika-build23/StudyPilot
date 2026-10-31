const mongoose = require('mongoose');

const examSchema = new mongoose.Schema(
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
      default: null,
    },
    dateSheetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DateSheet',
      default: null,
    },
    examName: {
      type: String,
      required: true,
      trim: true,
    },
    subjectCode: {
      type: String,
      trim: true,
      default: '',
    },
    examType: {
      type: String,
      default: 'THEORY',
      trim: true,
    },
    examCategory: {
      type: String,
      enum: ['UNIVERSITY_THEORY', 'PRACTICAL_INTERNAL'],
      default: 'UNIVERSITY_THEORY',
      index: true,
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
    examDate: {
      type: Date,
      required: true,
      index: true,
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
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    location: {
      type: String,
      trim: true,
      default: '',
    },
    source: {
      type: String,
      enum: ['DATE_SHEET_PDF', 'MANUAL'],
      default: 'MANUAL',
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'CONFIRMED', 'NEEDS_REVIEW'],
      default: 'CONFIRMED',
    },
    notes: {
      type: String,
      trim: true,
      default: '',
    },
    syllabusTopics: {
      type: [String],
      default: [],
    },
    dailyAvailableHours: {
      type: Number,
      default: 2,
      min: 0.5,
      max: 16,
    },
    status: {
      type: String,
      enum: ['upcoming', 'completed'],
      default: 'upcoming',
      index: true,
    },
  },
  { timestamps: true }
);

examSchema.index({ userId: 1, examCategory: 1, examDate: 1 });
examSchema.index({ userId: 1, subjectCode: 1, examDate: 1 });

module.exports = mongoose.model('Exam', examSchema);
