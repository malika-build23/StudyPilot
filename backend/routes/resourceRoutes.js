const express = require('express');
const router = express.Router();

const {
  getAuthUrl,
  handleGoogleHttpCallback,
  oauthCallback,
  connectDrive,
  connectWithToken,
  getConnection,
  getIndexStatus,
  startIndexing,
  searchResources,
  getResources,
  syncResources,
  disconnectDrive,
} = require('../controllers/resourceController');
const { protect } = require('../middleware/auth');

// Public browser redirect callback from Google OAuth (authenticated via signed state)
router.get('/google/callback', handleGoogleHttpCallback);

// All subsequent resource finder routes require JWT student authentication
router.use(protect);

// Test verification endpoint
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Smart Resource Finder API is fully operational.',
  });
});

// Google OAuth authorization URL generator & callback
router.get('/auth-url', getAuthUrl);
router.post('/oauth-callback', oauthCallback);

// Google Drive Folder Connection
router.post('/connect', connectDrive);
router.post('/connect-token', connectWithToken);
router.get('/connection', getConnection);
router.delete('/disconnect', disconnectDrive);

// Recursive Indexing & Progress Status
router.post('/index', startIndexing);
router.get('/index-status', getIndexStatus);

// Smart Keyword-Based Search & Discovery
router.post('/search', searchResources);
router.get('/', getResources);

// Sync & Refresh
router.post('/sync', syncResources);

module.exports = router;
