
const { google } = require('googleapis');

const SCOPES = [
  'openid',
  'email',
  'https://www.googleapis.com/auth/drive.metadata.readonly',
];

const createOAuthClient = () => {
  const {
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_DRIVE_REDIRECT_URI,
  } = process.env;

  if (
    !GOOGLE_CLIENT_ID ||
    !GOOGLE_CLIENT_SECRET ||
    !GOOGLE_DRIVE_REDIRECT_URI
  ) {
    throw new Error('Google Drive OAuth environment variables are missing.');
  }

  return new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    GOOGLE_DRIVE_REDIRECT_URI
  );
};

// Generate Google's authorization URL
const getAuthorizationUrl = (state) => {
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
    email: data.email,
    name: data.name,
  };
};

// Retrieve folder details using the student's dynamic folder ID
const getFolderMetadata = async (tokens, folderId) => {
  if (!folderId) {
    throw new Error('Google Drive folder ID is required.');
  }

  const oauth2Client = createOAuthClient();
  oauth2Client.setCredentials(tokens);

  const drive = google.drive({
    version: 'v3',
    auth: oauth2Client,
  });

  const { data } = await drive.files.get({
    fileId: folderId,
    fields: 'id,name,mimeType,webViewLink,parents,modifiedTime',
    supportsAllDrives: true,
  });

  if (data.mimeType !== 'application/vnd.google-apps.folder') {
    throw new Error('The supplied Google Drive link is not a folder.');
  }

  return data;
};

module.exports = {
  SCOPES,
  createOAuthClient,
  getAuthorizationUrl,
  exchangeCodeForTokens,
  getGoogleProfile,
  getFolderMetadata,
};
