const mongoose = require('mongoose');
const Exam = require('../models/Exam');
const Subject = require('../models/Subject');
const StudyPlan = require('../models/StudyPlan');

const getUserId = (req) => req.user._id;

// Helper to determine live status based on date and time
const computeExamStatus = (exam) => {
  const now = new Date();
  const examDate = new Date(exam.examDate);

  if (exam.endTime) {
    const [hours, mins] = exam.endTime.split(':').map(Number);
    if (!Number.isNaN(hours)) {
      examDate.setHours(hours, mins || 0, 0, 0);
      return now > examDate ? 'completed' : 'upcoming';
    }
  }

  // Fallback to end of the exam day
  examDate.setHours(23, 59, 59, 999);
  return now > examDate ? 'completed' : 'upcoming';
};

// @desc    Create a general exam (Phase 4 Part A compatible)
// @route   POST /api/exams
const createExam = async (req, res, next) => {
  try {
    const {
      subjectId,
      examName,
      examDate,
      syllabusTopics,
      dailyAvailableHours,
      subjectCode,
      examType,
      examCategory,
      startTime,
      endTime,
      location,
      notes,
    } = req.body;

    if (!examName?.trim() || !examDate) {
      return res.status(400).json({
        success: false,
        message: 'Please provide exam name and date.',
      });
    }

    if (subjectId && !mongoose.Types.ObjectId.isValid(subjectId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid subject ID.',
      });
    }

    const parsedDate = new Date(examDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid exam date.',
      });
    }

    const hours = Number(dailyAvailableHours) || 2;
    const topics = Array.isArray(syllabusTopics)
      ? syllabusTopics.filter((t) => typeof t === 'string' && t.trim()).map((t) => t.trim())
      : [examName.trim()];

    const exam = await Exam.create({
      userId: getUserId(req),
      subjectId: subjectId || null,
      examName: examName.trim(),
      subjectCode: subjectCode?.trim() || '',
      examType: examType?.trim() || 'THEORY',
      examCategory: examCategory || 'UNIVERSITY_THEORY',
      examDate: parsedDate,
      startTime: startTime?.trim() || '',
      endTime: endTime?.trim() || '',
      location: location?.trim() || '',
      notes: notes?.trim() || '',
      syllabusTopics: topics,
      dailyAvailableHours: hours,
      source: 'MANUAL',
      verificationStatus: 'CONFIRMED',
      status: parsedDate < new Date() ? 'completed' : 'upcoming',
    });

    const populatedExam = await Exam.findById(exam._id).populate('subjectId', 'subjectName');

    return res.status(201).json({
      success: true,
      message: 'Exam created successfully.',
      data: populatedExam,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all exams belonging to logged-in user
// @route   GET /api/exams
const getExams = async (req, res, next) => {
  try {
    const exams = await Exam.find({
      userId: getUserId(req),
    })
      .populate('subjectId', 'subjectName')
      .sort({ examDate: 1 });

    return res.status(200).json({
      success: true,
      data: exams,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single exam
// @route   GET /api/exams/:id
const getExamById = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam ID.',
      });
    }

    const exam = await Exam.findOne({
      _id: req.params.id,
      userId: getUserId(req),
    }).populate('subjectId', 'subjectName');

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: exam,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update an exam
// @route   PUT /api/exams/:id
const updateExam = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam ID.',
      });
    }

    const exam = await Exam.findOne({
      _id: req.params.id,
      userId: getUserId(req),
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found.',
      });
    }

    const {
      subjectId,
      examName,
      subjectCode,
      examType,
      examCategory,
      semester,
      branch,
      examDate,
      startTime,
      endTime,
      location,
      notes,
      syllabusTopics,
      dailyAvailableHours,
      status,
    } = req.body;

    if (subjectId !== undefined) {
      if (subjectId && !mongoose.Types.ObjectId.isValid(subjectId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subject ID.',
        });
      }
      exam.subjectId = subjectId || null;
    }

    if (examName !== undefined) {
      if (typeof examName !== 'string' || !examName.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Exam name cannot be empty.',
        });
      }
      exam.examName = examName.trim();
    }

    if (subjectCode !== undefined) exam.subjectCode = subjectCode.trim();
    if (examType !== undefined) exam.examType = examType.trim();
    if (examCategory !== undefined) exam.examCategory = examCategory;
    if (semester !== undefined) exam.semester = semester;
    if (branch !== undefined) exam.branch = branch;
    if (startTime !== undefined) exam.startTime = startTime.trim();
    if (endTime !== undefined) exam.endTime = endTime.trim();
    if (location !== undefined) exam.location = location.trim();
    if (notes !== undefined) exam.notes = notes.trim();

    if (examDate !== undefined) {
      const parsedDate = new Date(examDate);
      if (Number.isNaN(parsedDate.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid exam date.',
        });
      }
      exam.examDate = parsedDate;
    }

    if (syllabusTopics !== undefined && Array.isArray(syllabusTopics)) {
      exam.syllabusTopics = syllabusTopics
        .filter((t) => typeof t === 'string' && t.trim())
        .map((t) => t.trim());
    }

    if (dailyAvailableHours !== undefined) {
      const hours = Number(dailyAvailableHours);
      if (Number.isFinite(hours) && hours >= 0.5 && hours <= 16) {
        exam.dailyAvailableHours = hours;
      }
    }

    if (status !== undefined && ['upcoming', 'completed'].includes(status)) {
      exam.status = status;
    } else {
      exam.status = computeExamStatus(exam);
    }

    await exam.save();

    const updatedExam = await Exam.findById(exam._id).populate('subjectId', 'subjectName');

    return res.status(200).json({
      success: true,
      message: 'Exam updated successfully.',
      data: updatedExam,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an exam and its associated study plan
// @route   DELETE /api/exams/:id
const deleteExam = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid exam ID.',
      });
    }

    const exam = await Exam.findOne({
      _id: req.params.id,
      userId: getUserId(req),
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: 'Exam not found.',
      });
    }

    await StudyPlan.deleteOne({
      examId: exam._id,
      userId: getUserId(req),
    });

    await exam.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Exam and its study plan deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------------------------
// UNIVERSITY EXAMINATIONS
// -------------------------------------------------------------

// @desc    Get all university theory examinations
// @route   GET /api/exams/university
const getUniversityExams = async (req, res, next) => {
  try {
    const exams = await Exam.find({
      userId: getUserId(req),
      examCategory: 'UNIVERSITY_THEORY',
    })
      .populate('subjectId', 'subjectName')
      .sort({ examDate: 1 });

    return res.status(200).json({
      success: true,
      count: exams.length,
      data: exams,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a university theory examination manually
// @route   POST /api/exams/university
const createUniversityExam = async (req, res, next) => {
  try {
    const {
      examName,
      subjectCode,
      examDate,
      startTime,
      endTime,
      semester,
      branch,
      syllabusTopics,
      dailyAvailableHours,
      notes,
    } = req.body;

    if (!examName?.trim() || !examDate) {
      return res.status(400).json({
        success: false,
        message: 'Exam name and date are required.',
      });
    }

    const parsedDate = new Date(examDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Valid examination date is required.',
      });
    }

    const topics = Array.isArray(syllabusTopics) && syllabusTopics.length > 0
      ? syllabusTopics.filter(Boolean)
      : [examName.trim()];

    const exam = await Exam.create({
      userId: getUserId(req),
      examName: examName.trim(),
      subjectCode: subjectCode?.trim() || '',
      examType: 'THEORY',
      examCategory: 'UNIVERSITY_THEORY',
      examDate: parsedDate,
      startTime: startTime?.trim() || '',
      endTime: endTime?.trim() || '',
      semester: semester?.trim() || '',
      branch: branch?.trim() || '',
      syllabusTopics: topics,
      dailyAvailableHours: Number(dailyAvailableHours) || 2,
      notes: notes?.trim() || '',
      source: 'MANUAL',
      verificationStatus: 'CONFIRMED',
      status: parsedDate < new Date() ? 'completed' : 'upcoming',
    });

    return res.status(201).json({
      success: true,
      message: 'University examination created successfully.',
      data: exam,
    });
  } catch (error) {
    next(error);
  }
};

// -------------------------------------------------------------
// PRACTICAL, LAB, VIVA & INTERNAL EXAMINATIONS
// -------------------------------------------------------------

// @desc    Get all practical & internal examinations
// @route   GET /api/exams/practical
const getPracticalExams = async (req, res, next) => {
  try {
    const exams = await Exam.find({
      userId: getUserId(req),
      examCategory: 'PRACTICAL_INTERNAL',
    })
      .populate('subjectId', 'subjectName')
      .sort({ examDate: 1 });

    return res.status(200).json({
      success: true,
      count: exams.length,
      data: exams,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a practical/internal examination
// @route   POST /api/exams/practical
const createPracticalExam = async (req, res, next) => {
  try {
    const {
      examName,
      subjectId,
      subjectCode,
      examType, // Practical, Laboratory, Viva, Class Quiz, Internal Assessment, Mid-Semester
      semester,
      examDate,
      startTime,
      endTime,
      location,
      notes,
    } = req.body;

    if (!examName?.trim() || !examDate) {
      return res.status(400).json({
        success: false,
        message: 'Examination name and date are required.',
      });
    }

    const parsedDate = new Date(examDate);
    if (Number.isNaN(parsedDate.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Valid examination date is required.',
      });
    }

    const validTypes = [
      'Practical Examination',
      'Laboratory Examination',
      'Viva',
      'Class Quiz',
      'Internal Assessment',
      'Mid-Semester Examination',
      'Other',
    ];

    const type = validTypes.includes(examType) ? examType : 'Practical Examination';

    const exam = await Exam.create({
      userId: getUserId(req),
      subjectId: subjectId && mongoose.Types.ObjectId.isValid(subjectId) ? subjectId : null,
      examName: examName.trim(),
      subjectCode: subjectCode?.trim() || '',
      examType: type,
      examCategory: 'PRACTICAL_INTERNAL',
      semester: semester?.trim() || '',
      examDate: parsedDate,
      startTime: startTime?.trim() || '',
      endTime: endTime?.trim() || '',
      location: location?.trim() || '',
      notes: notes?.trim() || '',
      syllabusTopics: [examName.trim()],
      dailyAvailableHours: 2,
      source: 'MANUAL',
      verificationStatus: 'CONFIRMED',
      status: parsedDate < new Date() ? 'completed' : 'upcoming',
    });

    const populated = await Exam.findById(exam._id).populate('subjectId', 'subjectName');

    return res.status(201).json({
      success: true,
      message: `${type} scheduled successfully.`,
      data: populated,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a practical/internal examination
// @route   PUT /api/exams/practical/:id
const updatePracticalExam = async (req, res, next) => {
  return updateExam(req, res, next);
};

// @desc    Delete a practical/internal examination
// @route   DELETE /api/exams/practical/:id
const deletePracticalExam = async (req, res, next) => {
  return deleteExam(req, res, next);
};

// -------------------------------------------------------------
// DASHBOARD, UPCOMING, CALENDAR & OVERVIEW APIS
// -------------------------------------------------------------

// @desc    Get complete exam metrics overview for Exam Planner dashboard
// @route   GET /api/exams/overview
const getExamsOverview = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const now = new Date();

    const allExams = await Exam.find({ userId })
      .populate('subjectId', 'subjectName')
      .sort({ examDate: 1 });

    let totalUpcoming = 0;
    let completedCount = 0;
    let upcomingUniversityCount = 0;
    let upcomingPracticalCount = 0;
    let nextUpcomingExam = null;
    let nearestDays = null;

    const upcomingList = [];
    const completedList = [];

    allExams.forEach((exam) => {
      const isUpcoming = computeExamStatus(exam) === 'upcoming';

      if (isUpcoming) {
        totalUpcoming++;
        upcomingList.push(exam);

        if (exam.examCategory === 'UNIVERSITY_THEORY') {
          upcomingUniversityCount++;
        } else {
          upcomingPracticalCount++;
        }

        if (!nextUpcomingExam) {
          nextUpcomingExam = exam;
          const diffMs = new Date(exam.examDate) - now;
          nearestDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        }
      } else {
        completedCount++;
        completedList.push(exam);
      }
    });

    return res.status(200).json({
      success: true,
      data: {
        totalExams: allExams.length,
        totalUpcoming,
        completedCount,
        upcomingUniversityCount,
        upcomingPracticalCount,
        nextUpcomingExam,
        nearestDays,
        recentUpcoming: upcomingList.slice(0, 5),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all upcoming examinations chronologically
// @route   GET /api/exams/upcoming
const getUpcomingExams = async (req, res, next) => {
  try {
    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const exams = await Exam.find({
      userId: getUserId(req),
      examDate: { $gte: now },
      status: 'upcoming',
    })
      .populate('subjectId', 'subjectName')
      .sort({ examDate: 1 });

    return res.status(200).json({
      success: true,
      count: exams.length,
      data: exams,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get examinations formatted for calendar view
// @route   GET /api/exams/calendar
const getCalendarExams = async (req, res, next) => {
  try {
    const { year, month } = req.query;
    const query = { userId: getUserId(req) };

    if (year && month) {
      const startDate = new Date(year, Number(month) - 1, 1);
      const endDate = new Date(year, Number(month), 0, 23, 59, 59, 999);
      query.examDate = { $gte: startDate, $lte: endDate };
    }

    const exams = await Exam.find(query)
      .populate('subjectId', 'subjectName')
      .sort({ examDate: 1 });

    return res.status(200).json({
      success: true,
      count: exams.length,
      data: exams,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all completed examinations
// @route   GET /api/exams/completed
const getCompletedExams = async (req, res, next) => {
  try {
    const now = new Date();
    const exams = await Exam.find({
      userId: getUserId(req),
      $or: [
        { status: 'completed' },
        { examDate: { $lt: now } },
      ],
    })
      .populate('subjectId', 'subjectName')
      .sort({ examDate: -1 });

    return res.status(200).json({
      success: true,
      count: exams.length,
      data: exams,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createExam,
  getExams,
  getExamById,
  updateExam,
  deleteExam,
  getUniversityExams,
  createUniversityExam,
  getPracticalExams,
  createPracticalExam,
  updatePracticalExam,
  deletePracticalExam,
  getExamsOverview,
  getUpcomingExams,
  getCalendarExams,
  getCompletedExams,
};
