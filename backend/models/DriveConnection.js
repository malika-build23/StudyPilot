
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
    },

    // Student's selected Google Drive folder
    folderId: {
      type: String,
      required: true,
    },

    folderName: {
      type: String,
      trim: true,
    },

    // These fields will contain encrypted tokens, never plaintext tokens
    encryptedAccessToken: {
      type: String,
      select: false,
    },

    encryptedRefreshToken: {
      type: String,
      select: false,
    },

    tokenExpiryDate: {
      type: Date,
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
      enum: ['connected', 'disconnected', 'error'],
      default: 'connected',
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  'DriveConnection',
  driveConnectionSchema
);
