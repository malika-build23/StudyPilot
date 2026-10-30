const Subject = require('../models/Subject');

// @desc    Create a new subject workspace
// @route   POST /api/subjects
// @access  Private
exports.createSubject = async (req, res, next) => {
  try {
    const { subjectName, description, semester } = req.body;

    if (!subjectName || !subjectName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject name is required.',
      });
    }

    const subject = await Subject.create({
      userId: req.user._id,
      subjectName: subjectName.trim(),
      description: description ? description.trim() : '',
      semester: semester ? semester.trim() : '',
    });

    res.status(201).json({
      success: true,
      message: 'Subject created successfully.',
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all subjects for the authenticated user
// @route   GET /api/subjects
// @access  Private
exports.getSubjects = async (req, res, next) => {
  try {
    // Strictly isolate by authenticated user ID
    const subjects = await Subject.find({ userId: req.user._id }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: subjects.length,
      data: subjects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single subject details
// @route   GET /api/subjects/:id
// @access  Private
exports.getSubjectById = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user._id, // Enforce ownership directly in query
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found or you do not have permission to view it.',
      });
    }

    res.status(200).json({
      success: true,
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a subject
// @route   PUT /api/subjects/:id
// @access  Private
exports.updateSubject = async (req, res, next) => {
  try {
    const { subjectName, description, semester } = req.body;

    if (subjectName !== undefined && !subjectName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject name cannot be empty.',
      });
    }

    const subject = await Subject.findOne({
      _id: req.params.id,
      userId: req.user._id, // Enforce ownership check
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found or you do not have permission to update it.',
      });
    }

    if (subjectName !== undefined) subject.subjectName = subjectName.trim();
    if (description !== undefined) subject.description = description.trim();
    if (semester !== undefined) subject.semester = semester.trim();

    await subject.save();

    res.status(200).json({
      success: true,
      message: 'Subject updated successfully.',
      data: subject,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private
exports.deleteSubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id, // Enforce ownership check
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found or you do not have permission to delete it.',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Subject deleted successfully.',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};
