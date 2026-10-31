const User = require('../models/User');
const Subject = require('../models/Subject');

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

// @desc    Update user profile (name, semester)
// @route   PUT /api/users/profile
// @access  Private
exports.updateUserProfile = async (req, res, next) => {
  try {
    const { name, semester } = req.body;

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
