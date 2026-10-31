
const mongoose = require('mongoose');

const studyMaterialSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subjectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
      required: true,
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
    fileType: {
      type: String,
      enum: ['pdf', 'ppt', 'pptx'],
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    extractedContent: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    processingStatus: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    ocrRequired: {
      type: Boolean,
      default: false,
    },
    errorMessage: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

studyMaterialSchema.virtual('fileUrl').get(function () {
  return this._fileUrl || null;
});

studyMaterialSchema.index({ userId: 1, subjectId: 1, createdAt: -1 });

module.exports = mongoose.model('StudyMaterial', studyMaterialSchema);
