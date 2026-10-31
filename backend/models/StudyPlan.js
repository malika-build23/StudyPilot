
const mongoose = require('mongoose');

const studyTaskSchema = new mongoose.Schema({
  topic: {
    type: String,
    required: true,
    trim: true,
  },
  taskType: {
    type: String,
    enum: ['study', 'revision', 'practice', 'buffer'],
    default: 'study',
  },
  duration: {
    type: Number,
    required: true,
    min: 1,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  isLocked: {
    type: Boolean,
    default: false,
  },
  originalDate: {
    type: Date,
    default: null,
  },
  rescheduled: {
    type: Boolean,
    default: false,
  },
  rescheduleReason: {
    type: String,
    trim: true,
    default: '',
  },
});

const dailyScheduleSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  tasks: [studyTaskSchema],
});

const adjustmentHistorySchema = new mongoose.Schema({
  adjustedAt: {
    type: Date,
    default: Date.now,
  },
  reason: {
    type: String,
    required: true,
    trim: true,
  },
  tasksRescheduled: {
    type: Number,
    default: 0,
  },
  weakTopicsBoosted: {
    type: Number,
    default: 0,
  },
  summary: {
    type: String,
    trim: true,
    default: '',
  },
  details: {
    type: [String],
    default: [],
  },
  hasOverloadWarning: {
    type: Boolean,
    default: false,
  },
});

const studyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    examId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Exam',
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      default: null,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    dailyStudyHours: {
      type: Number,
      required: true,
      min: 0.5,
      max: 16,
    },
    availableDaysOfWeek: {
      type: [Number],
      default: [0, 1, 2, 3, 4, 5, 6], // 0 = Sunday, 1 = Monday, ... 6 = Saturday
    },
    autoAdjustEnabled: {
      type: Boolean,
      default: true,
    },
    lastAdjustedAt: {
      type: Date,
      default: null,
    },
    adjustmentHistory: [adjustmentHistorySchema],
    schedule: [dailyScheduleSchema],
    status: {
      type: String,
      enum: ['active', 'completed'],
      default: 'active',
    },
  },
  { timestamps: true }
);

studyPlanSchema.index({ userId: 1, examId: 1 }, { unique: true });

module.exports = mongoose.model('StudyPlan', studyPlanSchema);
