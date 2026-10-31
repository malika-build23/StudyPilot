const DriveConnection = require('../models/DriveConnection');
const Resource = require('../models/Resource');
const {
  parseFolderId,
  getAuthorizationUrl,
  exchangeCodeForTokens,
  getGoogleProfile,
  getFolderMetadata,
  scanFolderRecursively,
} = require('../services/googleDriveService');
const { encrypt, decrypt } = require('../services/tokenEncryption');
const { classifyResource } = require('../services/resourceClassifierService');

/**
 * Helper to get decrypted tokens for a connection
 */
const getDecryptedTokens = async (connection) => {
  // Query with encrypted fields included
  const conn = await DriveConnection.findById(connection._id).select(
    '+encryptedAccessToken +encryptedRefreshToken'
  );

  if (!conn || (!conn.encryptedAccessToken && !conn.encryptedRefreshToken)) {
    return null;
  }

  const accessToken = decrypt(conn.encryptedAccessToken);
  const refreshToken = decrypt(conn.encryptedRefreshToken);

  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expiry_date: conn.tokenExpiryDate ? new Date(conn.tokenExpiryDate).getTime() : undefined,
  };
};

// @desc    Get Google OAuth authorization URL
// @route   GET /api/resources/auth-url
// @access  Private
exports.getAuthUrl = async (req, res, next) => {
  try {
    const { folderUrl = '' } = req.query;
    // Pass user ID and folderUrl in state
    const stateObj = {
      userId: req.user._id.toString(),
      folderUrl,
      timestamp: Date.now(),
    };
    const state = Buffer.from(JSON.stringify(stateObj)).toString('base64');
    const authUrl = getAuthorizationUrl(state);

    res.status(200).json({
      success: true,
      authUrl,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Handle Google OAuth browser redirect callback (GET /api/resources/google/callback)
// @route   GET /api/resources/google/callback
// @access  Public (authorized via encoded state containing user ID)
exports.handleGoogleHttpCallback = async (req, res, next) => {
  try {
    const { code, state, error } = req.query;
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';

    if (error) {
      console.warn('Google OAuth redirected with error:', error);
      return res.redirect(`${clientUrl}/dashboard?oauth_error=${encodeURIComponent(error)}`);
    }

    if (!code) {
      return res.redirect(`${clientUrl}/dashboard?oauth_error=No_code_received`);
    }

    let userId = null;
    let folderUrl = '';

    if (state) {
      try {
        const decoded = JSON.parse(Buffer.from(state, 'base64').toString('utf8'));
        userId = decoded.userId;
        folderUrl = decoded.folderUrl || '';
      } catch (parseErr) {
        console.warn('Could not parse OAuth state:', parseErr.message);
      }
    }

    if (!userId) {
      return res.redirect(`${clientUrl}/dashboard?oauth_error=Invalid_oauth_state`);
    }

    const tokens = await exchangeCodeForTokens(code);
    const profile = await getGoogleProfile(tokens);

    let folderId = parseFolderId(folderUrl);
    let folderName = 'Academic Drive Folder';

    if (folderId) {
      try {
        const meta = await getFolderMetadata(tokens, folderId);
        folderName = meta.name || folderName;
      } catch (fErr) {
        console.warn('Notice validating folder in callback:', fErr.message);
      }
    }

    const encryptedAccessToken = encrypt(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token
      ? encrypt(tokens.refresh_token)
      : null;

    let connection = await DriveConnection.findOne({ userId });

    if (connection) {
      connection.googleEmail = profile.email || connection.googleEmail;
      connection.encryptedAccessToken = encryptedAccessToken;
      if (encryptedRefreshToken) {
        connection.encryptedRefreshToken = encryptedRefreshToken;
      }
      if (tokens.expiry_date) {
        connection.tokenExpiryDate = new Date(tokens.expiry_date);
      }
      if (folderId) {
        connection.folderId = folderId;
        connection.folderName = folderName;
        connection.folderUrl = folderUrl;
      }
      connection.connectionStatus = 'connected';
      connection.indexingStatus = 'indexing';
      await connection.save();
    } else {
      connection = await DriveConnection.create({
        userId,
        googleEmail: profile.email,
        folderId: folderId || 'root',
        folderName,
        folderUrl,
        encryptedAccessToken,
        encryptedRefreshToken,
        tokenExpiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        connectionStatus: 'connected',
        indexingStatus: 'indexing',
      });
    }

    if (folderId && folderId !== 'root') {
      executeFolderIndexing(userId, connection, tokens).catch((err) =>
        console.error('Async indexing error after callback:', err)
      );
    }

    return res.redirect(`${clientUrl}/dashboard?drive_connected=true`);
  } catch (error) {
    console.error('Google callback error:', error);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    return res.redirect(`${clientUrl}/dashboard?oauth_error=${encodeURIComponent(error.message)}`);
  }
};

// @desc    OAuth callback handler for Google Drive
// @route   POST /api/resources/oauth-callback
// @access  Private
exports.oauthCallback = async (req, res, next) => {
  try {
    const { code, folderUrl = '' } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Google authorization code is required.',
      });
    }

    const tokens = await exchangeCodeForTokens(code);
    const profile = await getGoogleProfile(tokens);

    let folderId = parseFolderId(folderUrl);
    let folderName = 'Academic Drive Folder';

    // If folderUrl was provided, validate folder access immediately
    if (folderId) {
      try {
        const meta = await getFolderMetadata(tokens, folderId);
        folderName = meta.name || folderName;
      } catch (fErr) {
        console.warn('Folder access verification notice:', fErr.message);
      }
    }

    // Encrypt tokens before DB persistence
    const encryptedAccessToken = encrypt(tokens.access_token);
    const encryptedRefreshToken = tokens.refresh_token
      ? encrypt(tokens.refresh_token)
      : null;

    let connection = await DriveConnection.findOne({ userId: req.user._id });

    if (connection) {
      connection.googleEmail = profile.email || connection.googleEmail;
      connection.encryptedAccessToken = encryptedAccessToken;
      if (encryptedRefreshToken) {
        connection.encryptedRefreshToken = encryptedRefreshToken;
      }
      if (tokens.expiry_date) {
        connection.tokenExpiryDate = new Date(tokens.expiry_date);
      }
      if (folderId) {
        connection.folderId = folderId;
        connection.folderName = folderName;
        connection.folderUrl = folderUrl;
      }
      connection.connectionStatus = 'connected';
      await connection.save();
    } else {
      connection = await DriveConnection.create({
        userId: req.user._id,
        googleEmail: profile.email,
        folderId: folderId || 'root',
        folderName,
        folderUrl,
        encryptedAccessToken,
        encryptedRefreshToken,
        tokenExpiryDate: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        connectionStatus: 'connected',
      });
    }

    // If folderId was supplied, trigger indexing in background
    if (folderId && folderId !== 'root') {
      executeFolderIndexing(req.user._id, connection, tokens).catch((err) =>
        console.error('Async indexing error:', err)
      );
    }

    res.status(200).json({
      success: true,
      message: 'Google Drive connected successfully.',
      data: {
        folderId: connection.folderId,
        folderName: connection.folderName,
        folderUrl: connection.folderUrl,
        googleEmail: connection.googleEmail,
        connectionStatus: connection.connectionStatus,
        indexingStatus: connection.indexingStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Connect Google Drive folder using client-side access token (GIS Token Client - eliminates redirect_uri mismatch)
// @route   POST /api/resources/connect-token
// @access  Private
exports.connectWithToken = async (req, res, next) => {
  try {
    const { accessToken, folderUrl } = req.body;

    if (!accessToken) {
      return res.status(400).json({
        success: false,
        message: 'Google authorization access token is required.',
      });
    }

    if (!folderUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Google Drive folder link.',
      });
    }

    const folderId = parseFolderId(folderUrl);
    if (!folderId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid Google Drive folder link. Please ensure it is a valid Google Drive folder URL.',
      });
    }

    const tokens = { access_token: accessToken };

    // 1. Get Google user profile
    let profile = { email: '', name: '' };
    try {
      profile = await getGoogleProfile(tokens);
    } catch (pErr) {
      console.warn('Notice fetching Google profile with token:', pErr.message);
    }

    // 2. Validate folder access using provided access token
    let folderMetadata;
    try {
      folderMetadata = await getFolderMetadata(tokens, folderId);
    } catch (fErr) {
      return res.status(400).json({
        success: false,
        message: `Google Drive folder access error: ${fErr.message}`,
      });
    }

    // 3. Encrypt access token before persisting
    const encryptedAccessToken = encrypt(accessToken);

    let connection = await DriveConnection.findOne({ userId: req.user._id });

    if (connection) {
      connection.googleEmail = profile.email || connection.googleEmail;
      connection.encryptedAccessToken = encryptedAccessToken;
      connection.folderId = folderId;
      connection.folderName = folderMetadata.name || 'Academic Resources';
      connection.folderUrl = folderUrl;
      connection.connectionStatus = 'connected';
      connection.indexingStatus = 'indexing';
      connection.indexingProgress = {
        totalFiles: 0,
        scannedFolders: 0,
        currentStage: 'Starting recursive folder scan...',
        error: '',
      };
      await connection.save();
    } else {
      connection = await DriveConnection.create({
        userId: req.user._id,
        googleEmail: profile.email,
        folderId,
        folderName: folderMetadata.name || 'Academic Resources',
        folderUrl,
        encryptedAccessToken,
        connectionStatus: 'connected',
        indexingStatus: 'indexing',
        indexingProgress: {
          totalFiles: 0,
          scannedFolders: 0,
          currentStage: 'Starting recursive folder scan...',
          error: '',
        },
      });
    }

    // 4. Trigger asynchronous recursive scanning and indexing
    executeFolderIndexing(req.user._id, connection, tokens).catch((err) =>
      console.error('Async folder indexing error:', err)
    );

    res.status(200).json({
      success: true,
      message: 'Drive folder connected! Resource indexing is now underway.',
      data: {
        folderId: connection.folderId,
        folderName: connection.folderName,
        folderUrl: connection.folderUrl,
        googleEmail: connection.googleEmail,
        connectionStatus: connection.connectionStatus,
        indexingStatus: 'indexing',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Connect Google Drive folder via URL
// @route   POST /api/resources/connect
// @access  Private
exports.connectDrive = async (req, res, next) => {
  try {
    const { folderUrl } = req.body;

    if (!folderUrl || typeof folderUrl !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid Google Drive folder link.',
      });
    }

    const folderId = parseFolderId(folderUrl);
    if (!folderId) {
      return res.status(400).json({
        success: false,
        message:
          'Could not extract a valid Google Drive folder ID. Please ensure the link is a valid Google Drive folder URL.',
      });
    }

    let connection = await DriveConnection.findOne({ userId: req.user._id });

    // Check if we have valid tokens
    let tokens = null;
    if (connection) {
      tokens = await getDecryptedTokens(connection);
    }

    if (!tokens || !tokens.access_token) {
      // Need OAuth authorization
      const stateObj = {
        userId: req.user._id.toString(),
        folderUrl,
        folderId,
        timestamp: Date.now(),
      };
      const state = Buffer.from(JSON.stringify(stateObj)).toString('base64');
      const authUrl = getAuthorizationUrl(state);

      return res.status(200).json({
        success: true,
        needsAuth: true,
        message:
          'Google Drive authorization is required to access and scan this folder.',
        authUrl,
        folderId,
      });
    }

    // Validate folder access using existing tokens
    let folderMetadata;
    try {
      folderMetadata = await getFolderMetadata(tokens, folderId);
    } catch (permErr) {
      // If token expired or access denied, prompt re-authorization
      const stateObj = {
        userId: req.user._id.toString(),
        folderUrl,
        folderId,
        timestamp: Date.now(),
      };
      const state = Buffer.from(JSON.stringify(stateObj)).toString('base64');
      const authUrl = getAuthorizationUrl(state);

      return res.status(200).json({
        success: true,
        needsAuth: true,
        message: `Google authorization needed: ${permErr.message}`,
        authUrl,
        folderId,
      });
    }

    // Update connection with new folder info
    connection.folderId = folderId;
    connection.folderName = folderMetadata.name || 'Academic Resources';
    connection.folderUrl = folderUrl;
    connection.connectionStatus = 'connected';
    connection.indexingStatus = 'indexing';
    connection.indexingProgress = {
      totalFiles: 0,
      scannedFolders: 0,
      currentStage: 'Starting recursive folder scan...',
      error: '',
    };
    await connection.save();

    // Trigger asynchronous indexing
    executeFolderIndexing(req.user._id, connection, tokens).catch((err) =>
      console.error('Folder indexing error:', err)
    );

    res.status(200).json({
      success: true,
      message: 'Drive folder connected! Resource indexing is now underway.',
      data: {
        folderId: connection.folderId,
        folderName: connection.folderName,
        folderUrl: connection.folderUrl,
        googleEmail: connection.googleEmail,
        connectionStatus: connection.connectionStatus,
        indexingStatus: 'indexing',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current connection and indexing stats
// @route   GET /api/resources/connection
// @access  Private
exports.getConnection = async (req, res, next) => {
  try {
    const connection = await DriveConnection.findOne({
      userId: req.user._id,
    });

    if (!connection) {
      return res.status(200).json({
        success: true,
        data: null,
      });
    }

    const totalIndexed = await Resource.countDocuments({
      userId: req.user._id,
    });

    res.status(200).json({
      success: true,
      data: {
        folderId: connection.folderId,
        folderName: connection.folderName,
        folderUrl: connection.folderUrl,
        googleEmail: connection.googleEmail,
        connectionStatus: connection.connectionStatus,
        indexingStatus: connection.indexingStatus,
        indexingProgress: connection.indexingProgress,
        totalIndexedResources: totalIndexed,
        connectedAt: connection.connectedAt,
        lastSyncedAt: connection.lastSyncedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get indexing status progress
// @route   GET /api/resources/index-status
// @access  Private
exports.getIndexStatus = async (req, res, next) => {
  try {
    const connection = await DriveConnection.findOne({
      userId: req.user._id,
    });

    if (!connection) {
      return res.status(200).json({
        success: true,
        data: {
          indexingStatus: 'idle',
          totalIndexed: 0,
        },
      });
    }

    const totalIndexed = await Resource.countDocuments({
      userId: req.user._id,
    });

    res.status(200).json({
      success: true,
      data: {
        folderId: connection.folderId,
        folderName: connection.folderName,
        indexingStatus: connection.indexingStatus,
        indexingProgress: connection.indexingProgress,
        totalIndexed,
        lastSyncedAt: connection.lastSyncedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Trigger or re-trigger indexing of connected folder
// @route   POST /api/resources/index
// @access  Private
exports.startIndexing = async (req, res, next) => {
  try {
    const connection = await DriveConnection.findOne({
      userId: req.user._id,
    });

    if (!connection || !connection.folderId) {
      return res.status(400).json({
        success: false,
        message: 'No Google Drive folder connected. Please connect a folder first.',
      });
    }

    const tokens = await getDecryptedTokens(connection);
    if (!tokens) {
      return res.status(401).json({
        success: false,
        message: 'Google authorization expired. Please reconnect your folder.',
      });
    }

    connection.indexingStatus = 'indexing';
    connection.indexingProgress = {
      totalFiles: 0,
      scannedFolders: 0,
      currentStage: 'Queued for scanning...',
      error: '',
    };
    await connection.save();

    executeFolderIndexing(req.user._id, connection, tokens).catch((err) =>
      console.error('Execution indexing error:', err)
    );

    res.status(200).json({
      success: true,
      message: 'Indexing initiated.',
      data: {
        indexingStatus: 'indexing',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Smart search across indexed academic resources
// @route   POST /api/resources/search
// @access  Private
exports.searchResources = async (req, res, next) => {
  try {
    const { query = '', category = '', subject = '', semester = '' } = req.body;
    const userId = req.user._id;

    const trimmedQuery = query.trim();

    // Base query scoped to authenticated user
    const baseFilter = { userId };

    if (category && category !== 'All') {
      baseFilter.resourceType = category;
    }
    if (subject && subject !== 'All') {
      baseFilter.subject = new RegExp(`^${subject.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
    }
    if (semester && semester !== 'All') {
      baseFilter.semester = semester;
    }

    // If query is empty, return latest indexed resources
    if (!trimmedQuery) {
      const resources = await Resource.find(baseFilter)
        .sort({ lastModifiedTime: -1, createdAt: -1 })
        .limit(50);

      return res.status(200).json({
        success: true,
        count: resources.length,
        data: resources,
      });
    }

    // Multi-token keyword search & scoring
    // Break query into tokens: "EMT mid sem paper" -> ["emt", "mid", "sem", "paper"]
    const tokens = trimmedQuery
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 0);

    const regexTokens = tokens.map(
      (t) => new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i')
    );

    // Build $or conditions to capture any matching fields
    const searchConditions = tokens.map((t) => {
      const r = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      return {
        $or: [
          { fileName: r },
          { folderPath: r },
          { subject: r },
          { resourceType: r },
          { semester: r },
        ],
      };
    });

    const candidateFilter = {
      ...baseFilter,
      $or: searchConditions,
    };

    const candidates = await Resource.find(candidateFilter).limit(100);

    // Calculate smart relevance ranking score
    const queryLower = trimmedQuery.toLowerCase();

    const scored = candidates.map((doc) => {
      const fileNameLower = (doc.fileName || '').toLowerCase();
      const folderPathLower = (doc.folderPath || '').toLowerCase();
      const subjectLower = (doc.subject || '').toLowerCase();
      const categoryLower = (doc.resourceType || '').toLowerCase();
      const semesterLower = (doc.semester || '').toLowerCase();

      let score = 0;

      // 1. Exact full-query substring match in fileName (highest boost)
      if (fileNameLower.includes(queryLower)) {
        score += 50;
      }

      // 2. Exact match in Subject
      if (subjectLower && (queryLower.includes(subjectLower) || subjectLower.includes(queryLower))) {
        score += 35;
      }

      // 3. Exact match in Category
      if (categoryLower && (queryLower.includes(categoryLower) || categoryLower.includes(queryLower))) {
        score += 30;
      }

      // 4. Token-by-token scoring
      tokens.forEach((t) => {
        if (fileNameLower.includes(t)) score += 15;
        if (subjectLower.includes(t)) score += 10;
        if (categoryLower.includes(t)) score += 8;
        if (folderPathLower.includes(t)) score += 5;
        if (semesterLower.includes(t)) score += 5;
      });

      return {
        resource: doc,
        score,
      };
    });

    // Sort descending by relevance score
    scored.sort((a, b) => b.score - a.score);

    const sortedResources = scored.map((item) => item.resource);

    res.status(200).json({
      success: true,
      count: sortedResources.length,
      data: sortedResources,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all indexed resources with pagination and filters
// @route   GET /api/resources
// @access  Private
exports.getResources = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 20,
      category = '',
      subject = '',
      semester = '',
    } = req.query;

    const filter = { userId: req.user._id };

    if (category && category !== 'All') {
      filter.resourceType = category;
    }
    if (subject && subject !== 'All') {
      filter.subject = new RegExp(`^${subject.trim()}$`, 'i');
    }
    if (semester && semester !== 'All') {
      filter.semester = semester.trim();
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const total = await Resource.countDocuments(filter);

    const resources = await Resource.find(filter)
      .sort({ lastModifiedTime: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    // Also get distinct categories and subjects for quick filtering in the UI
    const [distinctCategories, distinctSubjects] = await Promise.all([
      Resource.distinct('resourceType', { userId: req.user._id }),
      Resource.distinct('subject', { userId: req.user._id }),
    ]);

    res.status(200).json({
      success: true,
      count: resources.length,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
      categories: distinctCategories.filter(Boolean),
      subjects: distinctSubjects.filter(Boolean),
      data: resources,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Refresh / synchronize connected folder index
// @route   POST /api/resources/sync
// @access  Private
exports.syncResources = async (req, res, next) => {
  try {
    const connection = await DriveConnection.findOne({
      userId: req.user._id,
    });

    if (!connection || !connection.folderId) {
      return res.status(400).json({
        success: false,
        message: 'No Google Drive folder connected to sync.',
      });
    }

    const tokens = await getDecryptedTokens(connection);
    if (!tokens) {
      return res.status(401).json({
        success: false,
        message: 'Google authorization expired. Please reconnect your folder.',
      });
    }

    connection.indexingStatus = 'indexing';
    connection.indexingProgress = {
      totalFiles: 0,
      scannedFolders: 0,
      currentStage: 'Synchronizing Drive changes...',
      error: '',
    };
    await connection.save();

    executeFolderIndexing(req.user._id, connection, tokens).catch((err) =>
      console.error('Execution sync error:', err)
    );

    res.status(200).json({
      success: true,
      message: 'Sync started. Detecting new, modified, or removed files.',
      data: {
        indexingStatus: 'indexing',
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Disconnect Google Drive folder and clear indexed metadata
// @route   DELETE /api/resources/disconnect
// @access  Private
exports.disconnectDrive = async (req, res, next) => {
  try {
    const userId = req.user._id;

    await Promise.all([
      DriveConnection.deleteOne({ userId }),
      Resource.deleteMany({ userId }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Google Drive folder disconnected and indexed resources removed.',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Background async worker to perform recursive Drive scan and bulk metadata indexing
 */
async function executeFolderIndexing(userId, connection, tokens) {
  try {
    console.log(
      `[Smart Resource Finder] Starting scan for user ${userId}, folder: ${connection.folderName} (${connection.folderId})`
    );

    // 1. Scan folder recursively
    const discoveredFiles = await scanFolderRecursively(
      tokens,
      connection.folderId,
      connection.folderName,
      async ({ scannedFolders, totalFiles, currentFolder }) => {
        // Debounced or periodic progress update
        if (scannedFolders % 3 === 0) {
          await DriveConnection.updateOne(
            { _id: connection._id },
            {
              'indexingProgress.scannedFolders': scannedFolders,
              'indexingProgress.totalFiles': totalFiles,
              'indexingProgress.currentStage': `Scanning folder: ${currentFolder}...`,
            }
          );
        }
      }
    );

    console.log(
      `[Smart Resource Finder] Found ${discoveredFiles.length} files. Enriching metadata & bulk indexing...`
    );

    await DriveConnection.updateOne(
      { _id: connection._id },
      {
        'indexingProgress.totalFiles': discoveredFiles.length,
        'indexingProgress.currentStage': 'Classifying academic resources...',
      }
    );

    const activeDriveFileIds = new Set();

    // 2. Prepare bulk upsert operations
    const bulkOps = discoveredFiles.map((file) => {
      activeDriveFileIds.add(file.driveFileId);

      // Lightweight classification
      const classification = classifyResource({
        fileName: file.fileName,
        folderPath: file.folderPath,
        mimeType: file.mimeType,
      });

      return {
        updateOne: {
          filter: {
            userId,
            driveFileId: file.driveFileId,
          },
          update: {
            $set: {
              userId,
              driveFileId: file.driveFileId,
              fileName: file.fileName,
              mimeType: file.mimeType,
              webViewLink: file.webViewLink,
              folderPath: file.folderPath,
              parentFolderId: file.parentFolderId,
              parentFolderName: file.parentFolderName,
              subject: classification.subject,
              semester: classification.semester,
              resourceType: classification.resourceType,
              fileSize: file.fileSize,
              lastModifiedTime: file.lastModifiedTime,
              indexedAt: new Date(),
              processingStatus: 'indexed',
            },
          },
          upsert: true,
        },
      };
    });

    if (bulkOps.length > 0) {
      await Resource.bulkWrite(bulkOps, { ordered: false });
    }

    // 3. Remove files that were deleted in Google Drive since last scan
    if (activeDriveFileIds.size > 0) {
      await Resource.deleteMany({
        userId,
        driveFileId: { $nin: Array.from(activeDriveFileIds) },
      });
    }

    const totalCount = await Resource.countDocuments({ userId });

    // 4. Mark connection completed
    await DriveConnection.updateOne(
      { _id: connection._id },
      {
        indexingStatus: 'completed',
        lastSyncedAt: new Date(),
        totalIndexedResources: totalCount,
        'indexingProgress.currentStage': `Completed. Indexed ${totalCount} academic resources.`,
        'indexingProgress.totalFiles': totalCount,
      }
    );

    console.log(
      `[Smart Resource Finder] Successfully completed indexing for user ${userId}. Total resources: ${totalCount}`
    );
  } catch (err) {
    console.error(`[Smart Resource Finder] Indexing error:`, err);
    await DriveConnection.updateOne(
      { _id: connection._id },
      {
        indexingStatus: 'error',
        'indexingProgress.error': err.message,
        'indexingProgress.currentStage': `Indexing stopped: ${err.message}`,
      }
    );
  }
}
