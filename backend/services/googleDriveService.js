const { google } = require('googleapis');

const SCOPES = [
  'openid',
  'email',
  'https://www.googleapis.com/auth/drive.readonly',
];

/**
 * Extract Google Drive Folder ID from various URL formats
 * @param {string} urlOrId
 * @returns {string|null} folderId
 */
const parseFolderId = (urlOrId) => {
  if (!urlOrId || typeof urlOrId !== 'string') return null;

  const trimmed = urlOrId.trim();

  // Pattern 1: https://drive.google.com/drive/(u/\d+/)?folders/([a-zA-Z0-9_-]+)
  const folderMatch = trimmed.match(/folders\/([a-zA-Z0-9_-]+)/);
  if (folderMatch && folderMatch[1]) {
    return folderMatch[1];
  }

  // Pattern 2: id=([a-zA-Z0-9_-]+) query param
  const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (idMatch && idMatch[1]) {
    return idMatch[1];
  }

  // Pattern 3: If student pasted just the raw alphanumeric Google Drive ID (usually 25-50 chars)
  if (/^[a-zA-Z0-9_-]{15,60}$/.test(trimmed)) {
    return trimmed;
  }

  return null;
};

const createOAuthClient = () => {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const GOOGLE_DRIVE_REDIRECT_URI =
    process.env.GOOGLE_DRIVE_REDIRECT_URI ||
    `${process.env.CLIENT_URL || 'http://localhost:5173'}/dashboard`;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    throw new Error('Google OAuth credentials (GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET) are missing.');
  }

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_DRIVE_REDIRECT_URI
  );
};

// Generate Google's authorization URL
const getAuthorizationUrl = (state = '') => {
  const oauth2Client = createOAuthClient();

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    state,
  });
};

// Exchange Google's authorization code for tokens
const exchangeCodeForTokens = async (code) => {
  const oauth2Client = createOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);

  if (!tokens.access_token) {
    throw new Error('Google did not return an access token.');
  }

  return tokens;
};

// Get the Google account associated with the authorization
const getGoogleProfile = async (tokens) => {
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials(tokens);

  const oauth2 = google.oauth2({
    version: 'v2',
    auth: oauth2Client,
  });

  const { data } = await oauth2.userinfo.get();

  return {
    email: data.email || '',
    name: data.name || '',
  };
};

/**
 * Configure authenticated Drive client with token refresh support
 */
const getAuthenticatedDriveClient = (tokens) => {
  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials(tokens);

  return {
    drive: google.drive({ version: 'v3', auth: oauth2Client }),
    oauth2Client,
  };
};

// Retrieve folder details using the student's dynamic folder ID
const getFolderMetadata = async (tokens, folderId) => {
  if (!folderId) {
    throw new Error('Google Drive folder ID is required.');
  }

  const { drive } = getAuthenticatedDriveClient(tokens);

  try {
    const { data } = await drive.files.get({
      fileId: folderId,
      fields: 'id,name,mimeType,webViewLink,parents,modifiedTime',
      supportsAllDrives: true,
    });

    if (data.mimeType !== 'application/vnd.google-apps.folder') {
      throw new Error('The supplied Google Drive link is not a folder.');
    }

    return data;
  } catch (err) {
    const errorDetails = err.response?.data?.error?.message || err.message;
    console.error('[Google Drive API error details]:', errorDetails);

    if (
      errorDetails &&
      (errorDetails.includes('has not been used in project') ||
        errorDetails.includes('disabled') ||
        errorDetails.includes('Access Not Configured') ||
        errorDetails.includes('API has not been enabled'))
    ) {
      throw new Error(
        'Google Drive API is not enabled in your Google Cloud project. Please enable the Google Drive API in Google Cloud Console.'
      );
    }

    if (err.code === 404 || err.status === 404) {
      throw new Error('Folder not found. Please verify the folder link and permissions.');
    }

    if (err.code === 403 || err.status === 403) {
      throw new Error(
        `Permission denied: ${errorDetails || 'The connected Google account does not have read access to this folder.'}`
      );
    }
    throw new Error(errorDetails || err.message);
  }
};

/**
 * Recursive Google Drive folder scanner
 * Traverses root and nested subfolders collecting lightweight file metadata
 * @param {object} tokens - Google OAuth credentials
 * @param {string} rootFolderId - Root folder ID
 * @param {string} rootFolderName - Root folder name
 * @param {Function} onProgress - Progress callback ({ scannedFolders, totalFiles })
 * @returns {Promise<Array>} List of discovered file metadata
 */
const scanFolderRecursively = async (
  tokens,
  rootFolderId,
  rootFolderName = 'Academic Drive',
  onProgress = null
) => {
  const { drive } = getAuthenticatedDriveClient(tokens);

  const discoveredFiles = [];
  const visitedFolders = new Set();
  const folderQueue = [
    {
      id: rootFolderId,
      name: rootFolderName,
      path: `/${rootFolderName}`,
    },
  ];

  let scannedFoldersCount = 0;

  while (folderQueue.length > 0) {
    const currentFolder = folderQueue.shift();

    if (visitedFolders.has(currentFolder.id)) {
      continue;
    }
    visitedFolders.add(currentFolder.id);
    scannedFoldersCount++;

    if (onProgress) {
      onProgress({
        scannedFolders: scannedFoldersCount,
        totalFiles: discoveredFiles.length,
        currentFolder: currentFolder.name,
      });
    }

    let pageToken = null;

    do {
      try {
        const res = await drive.files.list({
          q: `'${currentFolder.id}' in parents and trashed = false`,
          fields:
            'nextPageToken, files(id, name, mimeType, webViewLink, size, modifiedTime, parents)',
          pageSize: 100,
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
          pageToken: pageToken,
        });

        const items = res.data.files || [];

        for (const item of items) {
          if (item.mimeType === 'application/vnd.google-apps.folder') {
            // Queue subfolder for recursive inspection
            folderQueue.push({
              id: item.id,
              name: item.name,
              path: `${currentFolder.path}/${item.name}`,
            });
          } else {
            // Filter academic resources (PDFs, Documents, Presentations, Spreadsheets, Images, Text)
            // or store all non-system files
            discoveredFiles.push({
              driveFileId: item.id,
              fileName: item.name,
              mimeType: item.mimeType || 'application/octet-stream',
              webViewLink:
                item.webViewLink ||
                `https://drive.google.com/file/d/${item.id}/view`,
              folderPath: currentFolder.path,
              parentFolderId: currentFolder.id,
              parentFolderName: currentFolder.name,
              fileSize: item.size ? parseInt(item.size, 10) : 0,
              lastModifiedTime: item.modifiedTime
                ? new Date(item.modifiedTime)
                : new Date(),
            });
          }
        }

        pageToken = res.data.nextPageToken;
      } catch (err) {
        console.warn(
          `[Drive Scanner] Warning reading folder ${currentFolder.name} (${currentFolder.id}):`,
          err.message
        );
        pageToken = null; // Break loop on error for this folder and continue with other branches
      }
    } while (pageToken);
  }

  return discoveredFiles;
};

module.exports = {
  SCOPES,
  parseFolderId,
  createOAuthClient,
  getAuthorizationUrl,
  exchangeCodeForTokens,
  getGoogleProfile,
  getAuthenticatedDriveClient,
  getFolderMetadata,
  scanFolderRecursively,
};
