const StudyMaterial = require('../models/StudyMaterial');
const DocumentAnalysis = require('../models/DocumentAnalysis');
const {
  generateDocumentAnalysis,
  answerDocumentQuestion,
} = require('../services/geminiService');

const getUserId = (req) => req.user._id;

// @desc    Generate or regenerate Gemini AI document analysis
// @route   POST /api/ai/materials/:id/analyse
// @access  Private
const analyseDocument = async (req, res, next) => {
  try {
    const materialId = req.params.id;

    const material = await StudyMaterial.findOne({
      _id: materialId,
      userId: getUserId(req),
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found or you do not have permission to access it.',
      });
    }

    if (material.processingStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot analyse document with status: ${material.processingStatus}. Extraction must be completed first.`,
      });
    }

    const pageCount =
      material.extractedContent?.pages?.length ||
      material.extractedContent?.slides?.length ||
      0;

    // Check for OCR required or completely empty text
    const hasText =
      (material.extractedContent?.pages &&
        material.extractedContent.pages.some((p) => p.text && p.text.trim().length > 0)) ||
      (material.extractedContent?.slides &&
        material.extractedContent.slides.some((s) => s.text && s.text.trim().length > 0));

    if (!hasText) {
      return res.status(422).json({
        success: false,
        message:
          'This document has no extractable text or requires OCR (e.g. scanned image PDF). Gemini AI analysis requires text content.',
      });
    }

    // Call Gemini Service
    const aiResult = await generateDocumentAnalysis(material.extractedContent, {
      fileName: material.fileName,
      pageOrSlideCount: pageCount,
    });

    // Check if an existing analysis exists to handle versioning or update
    const existingAnalysis = await DocumentAnalysis.findOne({
      materialId: material._id,
      userId: getUserId(req),
    }).sort({ analysisVersion: -1 });

    const newVersion = existingAnalysis ? existingAnalysis.analysisVersion + 1 : 1;

    const analysis = await DocumentAnalysis.create({
      userId: getUserId(req),
      subjectId: material.subjectId,
      materialId: material._id,
      analysisVersion: newVersion,
      summary: aiResult.summary,
      chapters: aiResult.chapters,
      importantConcepts: aiResult.importantConcepts,
      formulas: aiResult.formulas,
      importantQuestions: aiResult.importantQuestions,
      topics: aiResult.topics,
      metadata: {
        documentName: material.fileName,
        pageOrSlideCount: pageCount,
        modelUsed: aiResult.metadata.modelUsed,
        generatedAt: new Date(),
      },
    });

    return res.status(200).json({
      success: true,
      message: 'AI document intelligence generated successfully.',
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Retrieve saved document analysis without calling Gemini
// @route   GET /api/ai/materials/:id/analysis
// @access  Private
const getAnalysis = async (req, res, next) => {
  try {
    const materialId = req.params.id;

    // Verify material exists and belongs to authenticated student
    const material = await StudyMaterial.findOne({
      _id: materialId,
      userId: getUserId(req),
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found or you do not have permission to access it.',
      });
    }

    // Retrieve latest analysis version
    const analysis = await DocumentAnalysis.findOne({
      materialId: material._id,
      userId: getUserId(req),
    }).sort({ analysisVersion: -1 });

    if (!analysis) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No AI analysis generated yet for this study material.',
      });
    }

    return res.status(200).json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Ask a question about a specific document (AI Doubt Solver)
// @route   POST /api/ai/materials/:id/ask
// @access  Private
const askQuestion = async (req, res, next) => {
  try {
    const materialId = req.params.id;
    const { question } = req.body;

    if (!question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a question to ask about this document.',
      });
    }

    const material = await StudyMaterial.findOne({
      _id: materialId,
      userId: getUserId(req),
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found or you do not have permission to access it.',
      });
    }

    const pageCount =
      material.extractedContent?.pages?.length ||
      material.extractedContent?.slides?.length ||
      0;

    const answerResult = await answerDocumentQuestion(
      material.extractedContent,
      question.trim(),
      {
        fileName: material.fileName,
        pageOrSlideCount: pageCount,
      }
    );

    return res.status(200).json({
      success: true,
      data: answerResult,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyseDocument,
  getAnalysis,
  askQuestion,
};
