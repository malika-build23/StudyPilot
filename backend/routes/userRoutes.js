const express = require('express');
const router = express.Router();
const {
  getUserProfile,
  updateUserProfile,
  uploadProfilePicture,
  avatarUploadMiddleware,
} = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.route('/profile')
  .get(getUserProfile)
  .put(updateUserProfile);

// Upload profile picture endpoint
router.post('/profile/avatar', avatarUploadMiddleware, uploadProfilePicture);

module.exports = router;
