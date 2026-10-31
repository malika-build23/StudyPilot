const Subject = require('../models/Subject');
const StudyMaterial = require('../models/StudyMaterial');
const Exam = require('../models/Exam');
const StudyPlan = require('../models/StudyPlan');
const QuizEvaluation = require('../models/QuizEvaluation');

// @desc    Get dashboard statistics for authenticated student
// @route   GET /api/dashboard/stats
// @access  Private
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Fetch live counts, exams, study plans, and recent materials
    const [
      totalSubjects,
      totalStudyMaterials,
      totalQuizzes,
      totalExams,
      upcomingExams,
      studyPlans,
      recentSubjects,
      recentMaterials,
      recentEvaluations,
    ] = await Promise.all([
      Subject.countDocuments({ userId }),
      StudyMaterial.countDocuments({ userId }),
      QuizEvaluation.countDocuments({ userId }),
      Exam.countDocuments({ userId }),
      Exam.find({
        userId,
        status: 'upcoming',
        examDate: { $gte: today },
      })
        .populate('subjectId', 'subjectName')
        .sort({ examDate: 1 })
        .limit(5)
        .lean(),
      StudyPlan.find({ userId }).lean(),
      Subject.find({ userId }).sort({ updatedAt: -1 }).limit(5).lean(),
      StudyMaterial.find({ userId }).sort({ createdAt: -1 }).limit(5).lean(),
      QuizEvaluation.find({ userId })
        .populate('quizId', 'title difficulty')
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(),
    ]);

    // 1. Calculate Real Preparation Progress from Study Plan Tasks
    let totalPlanTasks = 0;
    let completedPlanTasks = 0;
    studyPlans.forEach((plan) => {
      (plan.schedule || []).forEach((day) => {
        (day.tasks || []).forEach((task) => {
          totalPlanTasks++;
          if (task.completed) completedPlanTasks++;
        });
      });
    });

    let preparationProgress = 0;
    if (totalPlanTasks > 0) {
      preparationProgress = Math.round((completedPlanTasks / totalPlanTasks) * 100);
    } else if (totalQuizzes > 0) {
      // If no study plans created yet, estimate initial readiness from quiz accuracy
      const avgAccuracy = recentEvaluations.reduce((sum, e) => sum + (e.percentage || 0), 0) / recentEvaluations.length;
      preparationProgress = Math.round(avgAccuracy * 0.5); // Cap at 50% until study plan tasks exist
    }

    // 2. Format Recent Activities from Real Database Records
    const recentActivity = [];

    // Recent Quiz Evaluations
    if (recentEvaluations.length > 0) {
      recentEvaluations.forEach((evaluation) => {
        recentActivity.push({
          id: `act-quiz-${evaluation._id}`,
          type: 'quiz_completed',
          title: `Quiz evaluated: ${evaluation.quizId?.title || 'Diagnostic Quiz'}`,
          description: `Score: ${evaluation.percentage}% • Accuracy tier: ${evaluation.percentage >= 60 ? 'Mastery' : 'Needs Review'}`,
          timestamp: evaluation.createdAt,
        });
      });
    }

    // Recent Study Materials
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

    // Recent Subjects
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

    // Sort combined activities by timestamp desc and take top 6
    recentActivity.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    const topActivities = recentActivity.slice(0, 6);

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
          totalStudyMaterials,
          totalQuizzes,
          totalExams,
          preparationProgress,
          totalPlanTasks,
          completedPlanTasks,
        },
        upcomingExams,
        recentActivity: topActivities,
      },
    });
  } catch (error) {
    next(error);
  }
};
