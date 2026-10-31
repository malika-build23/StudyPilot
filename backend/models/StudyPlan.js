
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
});

const dailyScheduleSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  tasks: [studyTaskSchema],
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
