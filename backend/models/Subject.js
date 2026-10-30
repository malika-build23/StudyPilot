const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Subject must belong to a user'],
      index: true,
    },
    subjectName: {
      type: String,
      required: [true, 'Subject name is required'],
      trim: true,
      maxlength: [120, 'Subject name cannot exceed 120 characters'],
    },
    description: {
      type: String,
      trim: true,
      default: '',
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    semester: {
      type: String,
      trim: true,
      default: '',
      maxlength: [50, 'Semester/Course info cannot exceed 50 characters'],
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to help fast sorting and user-scoped lookups
subjectSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Subject', subjectSchema);
