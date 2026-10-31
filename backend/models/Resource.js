const mongoose = require('mongoose');

const resourceCategories = [
  'Textbooks',
  'Reference Books',
  'Book Notes',
  'Lecture Notes',
  'Mid Semester Papers',
  'End Semester Papers',
  'Previous Year Questions',
  'Assignments',
  'Lab Manuals',
  'Practical Files',
  'Formula Sheets',
  'Other Resources',
];

const resourceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    driveFileId: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    mimeType: {
      type: String,
      default: 'application/pdf',
    },

    webViewLink: {
      type: String,
      required: true,
      trim: true,
    },

    folderPath: {
      type: String,
      default: '/',
      trim: true,
      index: true,
    },

    parentFolderId: {
      type: String,
      default: '',
    },

    parentFolderName: {
      type: String,
      default: '',
    },

    subject: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },

    semester: {
      type: String,
      default: '',
      trim: true,
      index: true,
    },

    resourceType: {
      type: String,
      enum: resourceCategories,
      default: 'Other Resources',
      index: true,
    },

    fileSize: {
      type: Number,
      default: 0,
    },

    lastModifiedTime: {
      type: Date,
      default: Date.now,
    },

    indexedAt: {
      type: Date,
      default: Date.now,
    },

    processingStatus: {
      type: String,
      enum: ['indexed', 'failed', 'pending'],
      default: 'indexed',
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate indexing for the same file under the same user
resourceSchema.index({ userId: 1, driveFileId: 1 }, { unique: true });

// Text index for multi-field search and relevance ranking
resourceSchema.index(
  {
    fileName: 'text',
    folderPath: 'text',
    subject: 'text',
    resourceType: 'text',
  },
  {
    weights: {
      fileName: 10,
      subject: 8,
      resourceType: 5,
      folderPath: 3,
    },
    name: 'ResourceTextSearchIndex',
  }
);

module.exports = mongoose.model('Resource', resourceSchema);
module.exports.RESOURCE_CATEGORIES = resourceCategories;
