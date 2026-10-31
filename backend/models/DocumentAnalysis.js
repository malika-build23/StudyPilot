const mongoose = require('mongoose');

const chapterSchema = new mongoose.Schema(
  {
    chapterTitle: { type: String, required: true },
    chapterSummary: { type: String, required: true },
    importantSubtopics: [{ type: String }],
    simpleExplanations: [
      {
        subtopic: { type: String },
        explanation: { type: String },
      },
    ],
    keyTakeaways: [{ type: String }],
  },
  { _id: false }
);

const conceptSchema = new mongoose.Schema(
  {
    conceptName: { type: String, required: true },
    definition: { type: String, required: true },
    relatedTopic: { type: String, default: 'General' },
    relevantChapter: { type: String, default: 'General' },
    explanation: { type: String, required: true },
  },
  { _id: false }
);

const formulaSchema = new mongoose.Schema(
  {
    formulaName: { type: String, required: true },
    expression: { type: String, required: true },
    explanationOfVariables: { type: String, default: '' },
    relatedTopic: { type: String, default: 'General' },
    relevantChapter: { type: String, default: 'General' },
  },
  { _id: false }
);

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    questionType: {
      type: String,
      enum: ['conceptual', 'short-answer', 'descriptive', 'numerical'],
      default: 'conceptual',
    },
    relatedChapter: { type: String, default: 'General' },
    relatedTopic: { type: String, default: 'General' },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    sourceClassification: {
      type: String,
      enum: ['source_extracted', 'ai_generated'],
      default: 'ai_generated',
    },
    suggestedAnswer: { type: String, default: '' },
  },
  { _id: false }
);

const topicClassificationSchema = new mongoose.Schema(
  {
    chapterName: { type: String, required: true },
    topics: [{ type: String }],
    subtopics: [{ type: String }],
  },
  { _id: false }
);

const documentAnalysisSchema = new mongoose.Schema(
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
      required: true,
      index: true,
    },
    analysisVersion: {
      type: Number,
      default: 1,
    },
    summary: {
      type: String,
      default: '',
    },
    chapters: [chapterSchema],
    importantConcepts: [conceptSchema],
    formulas: [formulaSchema],
    importantQuestions: [questionSchema],
    topics: [topicClassificationSchema],
    metadata: {
      documentName: { type: String },
      pageOrSlideCount: { type: Number, default: 0 },
      modelUsed: { type: String, default: 'gemini-3.8-flash' },
      generatedAt: { type: Date, default: Date.now },
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate analysis records for same material & version
documentAnalysisSchema.index({ materialId: 1, analysisVersion: 1 }, { unique: true });
documentAnalysisSchema.index({ userId: 1, subjectId: 1 });

module.exports = mongoose.model('DocumentAnalysis', documentAnalysisSchema);
