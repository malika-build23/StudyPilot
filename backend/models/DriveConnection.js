const mongoose = require('mongoose');

const driveConnectionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },

    googleEmail: {
      type: String,
      trim: true,
      default: '',
    },

    // Student's selected Google Drive folder
    folderId: {
      type: String,
      required: true,
    },

    folderName: {
      type: String,
      trim: true,
      default: 'Academic Drive Folder',
    },

    folderUrl: {
      type: String,
      trim: true,
      default: '',
    },

    // These fields will contain encrypted tokens, never plaintext tokens
    encryptedAccessToken: {
      type: String,
      select: false,
      default: null,
    },

    encryptedRefreshToken: {
      type: String,
      select: false,
      default: null,
    },

    tokenExpiryDate: {
      type: Date,
      default: null,
    },

    scopes: {
      type: [String],
      default: [],
    },

    connectedAt: {
      type: Date,
      default: Date.now,
    },

    lastSyncedAt: {
      type: Date,
      default: null,
    },

    connectionStatus: {
      type: String,
      enum: ['connected', 'disconnected', 'error', 'needs_auth'],
      default: 'connected',
    },

    indexingStatus: {
      type: String,
      enum: ['idle', 'indexing', 'completed', 'error'],
      default: 'idle',
    },

    indexingProgress: {
      totalFiles: { type: Number, default: 0 },
      scannedFolders: { type: Number, default: 0 },
      currentStage: { type: String, default: '' },
      error: { type: String, default: '' },
    },

    totalIndexedResources: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('DriveConnection', driveConnectionSchema);
