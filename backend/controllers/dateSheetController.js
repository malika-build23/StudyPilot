const crypto = require('crypto');
const path = require('path');
const DateSheet = require('../models/DateSheet');
const Exam = require('../models/Exam');
const User = require('../models/User');
const Subject = require('../models/Subject');
const { supabase, bucketName } = require('../config/storage');
const { processDocument } = require('../services/documentProcessor');
const { analyzeDateSheet } = require('../services/geminiService');

const getUserId = (req) => req.user._id;

// Helper to attach signed URL to DateSheet
const attachSignedUrl = async (dateSheet, expiresInSeconds = 3600) => {
  const plain = dateSheet.toObject ? dateSheet.toObject() : { ...dateSheet };
  if (!plain.storagePath) return plain;
  try {
    const { data } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(plain.storagePath, expiresInSeconds);
    plain.fileUrl = data?.signedUrl || null;
  } catch (err) {
    plain.fileUrl = null;
  }
  return plain;
};

// Helper to normalize semester strings (e.g. "Semester 3" -> "3", "3rd" -> "3", "III" -> "3")
const normalizeSemester = (val) => {
  if (!val) return '';
  const s = String(val).trim().toLowerCase();
  const digitMatch = s.match(/\b([1-8])\b/) || s.match(/semester\s*([1-8])/i);
  if (digitMatch) return digitMatch[1];

  const romanMap = { i: '1', ii: '2', iii: '3', iv: '4', v: '5', vi: '6', vii: '7', viii: '8' };
  if (romanMap[s]) return romanMap[s];

  return s;
};

// Helper to normalize branch names/codes
const normalizeBranch = (val) => {
  if (!val) return '';
  const b = String(val).trim().toUpperCase();

  const mappings = {
    'CSE': ['CSE', 'CS', 'COMPUTER SCIENCE', 'COMP. SCI', 'COMPUTER ENGINEERING'],
    'IT': ['IT', 'INFORMATION TECHNOLOGY', 'INFO TECH'],
    'ECE': ['ECE', 'EC', 'ELECTRONICS', 'ELECTRONICS AND COMMUNICATION', 'ELECTRONICS & COMMUNICATION'],
    'EE': ['EE', 'EEE', 'ELECTRICAL', 'ELECTRICAL ENGINEERING'],
    'ME': ['ME', 'MECHANICAL', 'MECHANICAL ENGINEERING'],
    'CE': ['CE', 'CIVIL', 'CIVIL ENGINEERING'],
    'CHE': ['CHE', 'CHEMICAL', 'CHEMICAL ENGINEERING'],
  };

  for (const [key, variants] of Object.entries(mappings)) {
    if (variants.some((v) => b.includes(v) || v.includes(b))) {
      return key;
    }
  }

  return b;
};

// Helper to filter extracted exams according to student semester & branch
const applyAcademicFilters = (extracted, semester, branch) => {
  const targetSem = normalizeSemester(semester);
  const targetBranch = normalizeBranch(branch);
  const filtered = [];

  (extracted || []).forEach((exam) => {
    const rawExam = exam.toObject ? exam.toObject() : exam;
    const examSem = normalizeSemester(rawExam.semester);
    const examBranch = normalizeBranch(rawExam.branch);
    const isCommonApplicability =
      rawExam.applicability === 'COMMON' ||
      ['ALL', 'COMMON', 'GEN', 'GENERAL'].includes(examBranch);

    // Check semester match
    const isSemMatch = !examSem || !targetSem || examSem === targetSem;
    const isOtherSem = examSem && targetSem && examSem !== targetSem;

    if (isOtherSem) {
      return; // Exclude other semesters
    }

    // Check branch match
    const isBranchMatch =
      isCommonApplicability ||
      !examBranch ||
      !targetBranch ||
      examBranch === targetBranch ||
      examBranch.includes(targetBranch) ||
      targetBranch.includes(examBranch);

    let applicability = rawExam.applicability;
    let verificationStatus = rawExam.verificationStatus;
    let selected = true;

    if (isCommonApplicability) {
      applicability = 'COMMON';
      verificationStatus = 'CONFIRMED';
    } else if (isBranchMatch && isSemMatch) {
      applicability = 'BRANCH_SPECIFIC';
      verificationStatus = 'CONFIRMED';
    } else {
      applicability = 'UNCERTAIN';
      verificationStatus = 'NEEDS_REVIEW';
      selected = false;
    }

    filtered.push({
      ...rawExam,
      applicability,
      verificationStatus,
      selected,
    });
  });

  return filtered;
};

// @desc    Upload university date sheet PDF & analyze with Gemini AI targeting student semester and branch
// @route   POST /api/date-sheets/upload
// @access  Private
const uploadDateSheet = async (req, res, next) => {
  let storagePath;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a date sheet PDF file to upload.',
      });
    }

    // MIME type check
    const isPdfMime = req.file.mimetype === 'application/pdf';
    const extension = path.extname(req.file.originalname).toLowerCase();
    if (!isPdfMime || extension !== '.pdf') {
      return res.status(400).json({
        success: false,
        message: 'Invalid file format. Only official PDF documents (.pdf) are allowed.',
      });
    }

    // Max file size: 20MB
    const MAX_SIZE = 20 * 1024 * 1024;
    if (req.file.size > MAX_SIZE) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds 20MB limit. Please upload a smaller date sheet PDF.',
      });
    }

    const { semester = '', branch = '' } = req.body;
    const userId = getUserId(req);
    const fileId = crypto.randomUUID();
    storagePath = `${userId}/datesheets/${fileId}${extension}`;

    // Upload to Supabase Storage
    const { error: storageError } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, req.file.buffer, {
        contentType: 'application/pdf',
        upsert: false,
      });

    if (storageError) {
      console.error('[Supabase Storage Error]:', storageError);
      throw new Error(`Failed to store date sheet in cloud storage: ${storageError.message}`);
    }

    // Extract text from PDF using OfficeParser
    let extractedContent;
    let ocrRequired = false;
    try {
      extractedContent = await processDocument(req.file.buffer, 'pdf');
      ocrRequired = Boolean(extractedContent.ocrRequired);
    } catch (parseError) {
      console.warn('[DateSheet OfficeParser Warning]: Text extraction yielded minimal content, fallback to OCR.', parseError);
      extractedContent = { format: 'pdf', pages: [], ocrRequired: true };
      ocrRequired = true;
    }

    // Create DateSheet record in DB with student's selected semester and branch
    const dateSheet = await DateSheet.create({
      userId,
      fileName: req.file.originalname,
      storagePath,
      fileSize: req.file.size,
      processingStatus: 'PROCESSING',
      ocrRequired,
      semester: String(semester || '').trim(),
      branch: String(branch || '').trim(),
      extractedExams: [],
      filteredExams: [],
    });

    // Run AI analysis with Gemini targeting the student's semester & branch
    let extractedExams = [];
    try {
      extractedExams = await analyzeDateSheet(extractedContent, req.file.buffer, {
        semester: dateSheet.semester,
        branch: dateSheet.branch,
      });
      dateSheet.extractedExams = extractedExams;

      // If semester & branch provided, populate filteredExams directly
      if (dateSheet.semester && dateSheet.branch) {
        dateSheet.filteredExams = applyAcademicFilters(
          extractedExams,
          dateSheet.semester,
          dateSheet.branch
        );

        // Update user academic profile if not set
        await User.findByIdAndUpdate(userId, {
          $set: {
            semester: dateSheet.semester,
            branch: dateSheet.branch,
          },
        }).catch(() => {});
      }

      dateSheet.processingStatus = 'COMPLETED';
      dateSheet.errorMessage = '';
      await dateSheet.save();
    } catch (aiError) {
      console.error('[DateSheet AI Analysis Error]:', aiError);
      dateSheet.processingStatus = 'FAILED';
      dateSheet.errorMessage = aiError.message;
      await dateSheet.save();

      return res.status(422).json({
        success: false,
        message: `Date sheet uploaded but AI analysis failed: ${aiError.message}`,
        data: await attachSignedUrl(dateSheet),
      });
    }

    const responseData = await attachSignedUrl(dateSheet);

    res.status(201).json({
      success: true,
      message: `Date sheet analyzed successfully. ${extractedExams.length} examination sessions extracted.`,
      data: responseData,
    });
  } catch (error) {
    console.error('[Upload DateSheet Error]:', error);
    if (storagePath) {
      await supabase.storage.from(bucketName).remove([storagePath]).catch(() => {});
    }
    next(error);
  }
};

// @desc    Re-analyze an existing uploaded date sheet
// @route   POST /api/date-sheets/:id/analyze
// @access  Private
const analyzeDateSheetById = async (req, res, next) => {
  try {
    const { semester, branch } = req.body || {};
    const dateSheet = await DateSheet.findOne({
      _id: req.params.id,
      userId: getUserId(req),
    });

    if (!dateSheet) {
      return res.status(404).json({
        success: false,
        message: 'Date sheet not found.',
      });
    }

    if (semester) dateSheet.semester = String(semester).trim();
    if (branch) dateSheet.branch = String(branch).trim();

    dateSheet.processingStatus = 'PROCESSING';
    await dateSheet.save();

    // Download PDF from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucketName)
      .download(dateSheet.storagePath);

    if (downloadError || !fileData) {
      throw new Error(`Could not retrieve date sheet from storage: ${downloadError?.message}`);
    }

    const buffer = Buffer.from(await fileData.arrayBuffer());
    const extractedContent = await processDocument(buffer, 'pdf').catch(() => ({
      format: 'pdf',
      pages: [],
      ocrRequired: true,
    }));

    const extractedExams = await analyzeDateSheet(extractedContent, buffer, {
      semester: dateSheet.semester,
      branch: dateSheet.branch,
    });

    dateSheet.extractedExams = extractedExams;
    if (dateSheet.semester && dateSheet.branch) {
      dateSheet.filteredExams = applyAcademicFilters(
        extractedExams,
        dateSheet.semester,
        dateSheet.branch
      );
    }
    dateSheet.processingStatus = 'COMPLETED';
    dateSheet.errorMessage = '';
    await dateSheet.save();

    const responseData = await attachSignedUrl(dateSheet);

    res.status(200).json({
      success: true,
      message: `Date sheet re-analyzed. ${extractedExams.length} examination sessions found.`,
      data: responseData,
    });
  } catch (error) {
    console.error('[Re-analyze DateSheet Error]:', error);
    next(error);
  }
};

// @desc    Get single date sheet with extraction and filter results
// @route   GET /api/date-sheets/:id
// @access  Private
const getDateSheet = async (req, res, next) => {
  try {
    const dateSheet = await DateSheet.findOne({
      _id: req.params.id,
      userId: getUserId(req),
    });

    if (!dateSheet) {
      return res.status(404).json({
        success: false,
        message: 'Date sheet not found.',
      });
    }

    const responseData = await attachSignedUrl(dateSheet);

    res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Filter date sheet exams according to semester and branch
// @route   POST /api/date-sheets/:id/filter
// @access  Private
const filterDateSheet = async (req, res, next) => {
  try {
    const { semester, branch } = req.body;

    if (!semester || !branch) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both semester and branch for filtering.',
      });
    }

    const dateSheet = await DateSheet.findOne({
      _id: req.params.id,
      userId: getUserId(req),
    });

    if (!dateSheet) {
      return res.status(404).json({
        success: false,
        message: 'Date sheet not found.',
      });
    }

    const filtered = applyAcademicFilters(dateSheet.extractedExams || [], semester, branch);

    dateSheet.semester = semester;
    dateSheet.branch = branch;
    dateSheet.filteredExams = filtered;
    await dateSheet.save();

    // Also update student profile with confirmed academic details if not already saved
    await User.findByIdAndUpdate(getUserId(req), {
      $set: {
        semester: semester,
        branch: branch,
      },
    }).catch(() => {});

    let matchedCount = 0;
    let commonCount = 0;
    let uncertainCount = 0;
    filtered.forEach((e) => {
      if (e.applicability === 'BRANCH_SPECIFIC') matchedCount++;
      else if (e.applicability === 'COMMON') commonCount++;
      else if (e.applicability === 'UNCERTAIN') uncertainCount++;
    });

    const responseData = await attachSignedUrl(dateSheet);

    res.status(200).json({
      success: true,
      message: `Filtered ${filtered.length} examination sessions for ${semester} (${branch}).`,
      data: {
        dateSheet: responseData,
        filteredExams: filtered,
        summary: {
          totalExtracted: dateSheet.extractedExams?.length || 0,
          totalFiltered: filtered.length,
          branchSpecific: matchedCount,
          common: commonCount,
          needsConfirmation: uncertainCount,
        },
      },
    });
  } catch (error) {
    console.error('[Filter DateSheet Error]:', error);
    next(error);
  }
};

// @desc    Confirm selected exams and save to student's University Examination Schedule
// @route   POST /api/date-sheets/:id/confirm
// @access  Private
const confirmDateSheet = async (req, res, next) => {
  try {
    const { exams } = req.body;

    if (!Array.isArray(exams) || exams.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No examinations were selected for confirmation.',
      });
    }

    const dateSheet = await DateSheet.findOne({
      _id: req.params.id,
      userId: getUserId(req),
    });

    if (!dateSheet) {
      return res.status(404).json({
        success: false,
        message: 'Date sheet not found.',
      });
    }

    const userId = getUserId(req);
    const createdExams = [];
    const skippedDuplicates = [];

    for (const item of exams) {
      if (!item.selected) continue;

      const subjectName = String(item.subjectName || '').trim();
      const examDateStr = String(item.examDate || '').trim();

      if (!subjectName || !examDateStr) {
        continue;
      }

      const examDate = new Date(examDateStr);
      if (Number.isNaN(examDate.getTime())) {
        continue;
      }

      const subjectCode = String(item.subjectCode || '').trim();
      const startTime = String(item.startTime || '').trim();
      const endTime = String(item.endTime || '').trim();

      // Duplicate detection query:
      // Check if this user already has an exam on the same date, time, and category with matching subject code or name
      const duplicateQuery = {
        userId,
        examDate: {
          $gte: new Date(examDate.setHours(0, 0, 0, 0)),
          $lte: new Date(examDate.setHours(23, 59, 59, 999)),
        },
        examCategory: 'UNIVERSITY_THEORY',
      };

      if (subjectCode) {
        duplicateQuery.$or = [
          { subjectCode: subjectCode },
          { examName: new RegExp(`^${subjectName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') },
        ];
      } else {
        duplicateQuery.examName = new RegExp(`^${subjectName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i');
      }

      const existing = await Exam.findOne(duplicateQuery);

      if (existing) {
        skippedDuplicates.push({
          subjectName,
          subjectCode,
          examDate: examDateStr,
          reason: 'Duplicate examination entry already exists in schedule.',
        });
        continue;
      }

      // Check if user has an existing Subject workspace with matching name or code to link to
      let linkedSubjectId = null;
      const matchedSubject = await Subject.findOne({
        userId,
        $or: [
          ...(subjectCode ? [{ code: new RegExp(`^${subjectCode}$`, 'i') }] : []),
          { name: new RegExp(`^${subjectName}$`, 'i') },
        ],
      });
      if (matchedSubject) {
        linkedSubjectId = matchedSubject._id;
      }

      const newExam = await Exam.create({
        userId,
        subjectId: linkedSubjectId,
        dateSheetId: dateSheet._id,
        examName: subjectName,
        subjectCode: subjectCode,
        examType: item.examType || 'THEORY',
        examCategory: 'UNIVERSITY_THEORY',
        semester: item.semester || dateSheet.semester || '',
        branch: item.branch || dateSheet.branch || '',
        examDate: new Date(examDateStr),
        startTime: startTime,
        endTime: endTime,
        timezone: item.timezone || 'Asia/Kolkata',
        location: item.location || '',
        source: 'DATE_SHEET_PDF',
        verificationStatus: 'CONFIRMED',
        notes: item.instructions || item.notes || '',
        syllabusTopics: [subjectName], // Default to subject name so study planning can start right away
        dailyAvailableHours: 2,
        status: 'upcoming',
      });

      createdExams.push(newExam);
    }

    res.status(201).json({
      success: true,
      message: `Successfully scheduled ${createdExams.length} university examinations. ${skippedDuplicates.length} duplicates skipped.`,
      data: {
        createdCount: createdExams.length,
        skippedCount: skippedDuplicates.length,
        exams: createdExams,
        skipped: skippedDuplicates,
      },
    });
  } catch (error) {
    console.error('[Confirm DateSheet Error]:', error);
    next(error);
  }
};

// @desc    Get all uploaded date sheets for authenticated user
// @route   GET /api/date-sheets
// @access  Private
const getDateSheets = async (req, res, next) => {
  try {
    const dateSheets = await DateSheet.find({
      userId: getUserId(req),
    }).sort({ createdAt: -1 });

    const withSignedUrls = await Promise.all(
      dateSheets.map((ds) => attachSignedUrl(ds))
    );

    res.status(200).json({
      success: true,
      count: withSignedUrls.length,
      data: withSignedUrls,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadDateSheet,
  analyzeDateSheetById,
  getDateSheet,
  filterDateSheet,
  confirmDateSheet,
  getDateSheets,
};
