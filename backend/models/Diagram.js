
const mongoose = require('mongoose');

const diagramSchema = new mongoose.Schema(
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
    diagramType: {
      type: String,
      required: true,
      enum: [
        'flowchart',
        'concept-map',
        'process',
        'hierarchical',
        'block-diagram',
        'step-by-step',
      ],
    },
    diagramSource: {
      type: String,
      required: true,
    },
    explanation: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

diagramSchema.index({ userId: 1, subjectId: 1, createdAt: -1 });
diagramSchema.index({ userId: 1, topic: 1 });

module.exports = mongoose.model('Diagram', diagramSchema);
