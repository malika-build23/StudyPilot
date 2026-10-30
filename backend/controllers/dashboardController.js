const Subject = require('../models/Subject');

// @desc    Get dashboard statistics for authenticated student
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch subjects count and most recent subjects
    const [totalSubjects, recentSubjects] = await Promise.all([
      Subject.countDocuments({ userId }),
      Subject.find({ userId }).sort({ updatedAt: -1 }).limit(5).lean(),
    ]);

    // Format recent activities from real actions or welcome event
    const recentActivity = [];

    if (recentSubjects.length > 0) {
      recentSubjects.forEach((sub) => {
        recentActivity.push({
          id: `act-sub-${sub._id}`,
          type: 'subject_created',
          title: `Created subject: ${sub.subjectName}`,
          description: sub.semester ? `Semester / Course: ${sub.semester}` : 'Subject workspace ready',
          timestamp: sub.updatedAt || sub.createdAt,
        });
      });
    }

    // Always append account setup event as baseline activity
    recentActivity.push({
      id: `act-welcome-${userId}`,
      type: 'account_created',
      title: 'Joined StudyPilot AI',
      description: 'Account created and verified.',
      timestamp: req.user.createdAt,
    });

    res.status(200).json({
      success: true,
      data: {
        student: {
          id: req.user._id,
          name: req.user.name,
          email: req.user.email,
        },
        metrics: {
          totalSubjects,
          totalStudyMaterials: 0, // Zero in Phase 1
          preparationProgress: 0,  // Zero in Phase 1
        },
        upcomingExams: [],         // Empty state for Phase 1
        recentActivity,
      },
    });
  } catch (error) {
    next(error);
  }
};
