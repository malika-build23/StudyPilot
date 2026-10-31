
const mongoose = require('mongoose');

const visualAssociationSchema = new mongoose.Schema(
  {
    concept: { type: String, required: true },
    symbol: { type: String, default: 'lightbulb' },
    visualDescription: { type: String, default: '' },
    memoryHint: { type: String, default: '' },
    illustrationPrompt: { type: String, default: '' },
  },
  { _id: false }
);

const memoryChartSchema = new mongoose.Schema(
  {
    keyword: { type: String, required: true },
    meaning: { type: String, default: '' },
    association: { type: String, default: '' },
    importance: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
  },
  { _id: false }
);

const recallQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    hint: { type: String, default: '' },
  },
  { _id: false }
);

const storySceneSchema = new mongoose.Schema(
  {
    sceneNumber: { type: Number, required: true },
    title: { type: String, default: '' },
    description: { type: String, required: true },
    conceptsRepresented: [{ type: String }],
    visualPrompt: { type: String, default: '' },
  },
  { _id: false }
);

const diagramSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        'flowchart',
        'concept-map',
        'process',
        'hierarchical',
        'block-diagram',
        'step-by-step',
      ],
      default: 'concept-map',
    },
    source: { type: String, default: '' },
    explanation: { type: String, default: '' },
  },
  { _id: false }
);

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

    // NEW: Visual memory associations
    visualAssociations: {
      type: [visualAssociationSchema],
      default: [],
    },

    // NEW: Keyword-to-meaning memory chart
    memoryChart: {
      type: [memoryChartSchema],
      default: [],
    },

    // NEW: Mermaid diagram data
    diagram: {
      type: diagramSchema,
      default: () => ({}),
    },

    // NEW: Story-based memory scenes
    storyScenes: {
      type: [storySceneSchema],
      default: [],
    },

    // NEW: Active recall questions
    recallQuestions: {
      type: [recallQuestionSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

mnemonicSchema.index({ userId: 1, subjectId: 1, createdAt: -1 });
mnemonicSchema.index({ userId: 1, topic: 1 });

module.exports = mongoose.model('Mnemonic', mnemonicSchema);
