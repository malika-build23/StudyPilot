const path = require('path');
const fs = require('fs');
const multer = require('multer');
const User = require('../models/User');
const Subject = require('../models/Subject');

// Ensure uploads/avatars directory exists
const avatarDir = path.join(__dirname, '../uploads/avatars');
if (!fs.existsSync(avatarDir)) {
  fs.mkdirSync(avatarDir, { recursive: true });
}

// Multer storage for profile pictures
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, avatarDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase() || '.png';
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `avatar-${req.user._id}-${uniqueSuffix}${ext}`);
  },
});

exports.avatarUploadMiddleware = multer({
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB limit
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const mime = file.mimetype.toLowerCase();
    if (allowed.test(ext) || allowed.test(mime) || mime.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPG, PNG, WebP, GIF) are allowed.'));
    }
  },
}).single('avatar');

// @desc    Get user profile details
// @route   GET /api/users/profile
// @access  Private
exports.getUserProfile = async (req, res, next) => {
  try {
    const userId = req.user._id;

    const [user, totalSubjects] = await Promise.all([
      User.findById(userId).select('-passwordHash'),
      Subject.countDocuments({ userId }),
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        semester: user.semester || '',
        avatar: user.avatar || '',
        isGoogleUser: Boolean(user.googleId),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        totalSubjects,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile (name, semester, avatar)
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    const { name, semester, avatar } = req.body;

    if (name !== undefined && !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Name cannot be empty.',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    if (name && name.trim()) {
      user.name = name.trim();
    }
    if (semester !== undefined) {
      user.semester = typeof semester === 'string' ? semester.trim() : '';
    }
    if (avatar !== undefined) {
      user.avatar = typeof avatar === 'string' ? avatar.trim() : '';
    }

    await user.save();

    const totalSubjects = await Subject.countDocuments({ userId: user._id });

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        semester: user.semester || '',
        avatar: user.avatar || '',
        isGoogleUser: Boolean(user.googleId),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        totalSubjects,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Upload new profile picture
// @route   POST /api/users/profile/avatar
// @access  Private
exports.uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an image file to upload as your profile picture.',
      });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User profile not found.',
      });
    }

    // Set web-accessible path
    const avatarUrl = `/uploads/avatars/${req.file.filename}`;
    user.avatar = avatarUrl;
    await user.save();

    const totalSubjects = await Subject.countDocuments({ userId: user._id });

    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded and updated successfully.',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        semester: user.semester || '',
        avatar: user.avatar,
        isGoogleUser: Boolean(user.googleId),
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        totalSubjects,
      },
    });
  } catch (error) {
    next(error);
  }
};
