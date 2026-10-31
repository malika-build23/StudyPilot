const Subject = require('../models/Subject');
const StudyMaterial = require('../models/StudyMaterial');

// @desc    Get dashboard statistics for authenticated student
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;

    // Fetch subjects count, study materials count, and recent records
    const [totalSubjects, totalStudyMaterials, recentSubjects, recentMaterials] = await Promise.all([
      Subject.countDocuments({ userId }),
      StudyMaterial.countDocuments({ userId }),
      Subject.find({ userId }).sort({ updatedAt: -1 }).limit(5).lean(),
      StudyMaterial.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
    ]);

    // Format recent activities from real actions or welcome event
    const recentActivity = [];

    if (recentMaterials.length > 0) {
      recentMaterials.forEach((mat) => {
        recentActivity.push({
          id: `act-mat-${mat._id}`,
          type: 'material_uploaded',
          title: `Uploaded document: ${mat.fileName}`,
          description: `Format: ${mat.fileType?.toUpperCase()} (${(mat.fileSize / 1024).toFixed(1)} KB)`,
          timestamp: mat.createdAt,
        });
      });
    }

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

    // Sort combined activities by timestamp desc and take top 5
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const topActivities = recentActivity.slice(0, 5);

    // Always append account setup event as baseline activity
    topActivities.push({
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
          totalStudyMaterials, // Live database count
          preparationProgress: 0,
        },
        upcomingExams: [],
        recentActivity: topActivities,
      },
    });
  } catch (error) {
    next(error);
  }
};
