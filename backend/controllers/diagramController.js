
const mongoose = require('mongoose');
const Diagram = require('../models/Diagram');
const Subject = require('../models/Subject');
const StudyMaterial = require('../models/StudyMaterial');
const { generateDiagram } = require('../services/geminiService');

const getUserId = (req) => req.user._id;

const validObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const validateSubject = async (subjectId, userId) => {
  if (!subjectId || !validObjectId(subjectId)) {
    throw new Error('A valid subject ID is required.');
  }

  const subject = await Subject.findOne({
    _id: subjectId,
    userId,
  });

  if (!subject) {
    throw new Error('Subject not found or access denied.');
  }

  return subject;
};

const validateMaterial = async (materialId, subjectId, userId) => {
  if (!materialId) return null;

  if (!validObjectId(materialId)) {
    throw new Error('Invalid study material ID.');
  }

  const material = await StudyMaterial.findOne({
    _id: materialId,
    subjectId,
    userId,
  });

  if (!material) {
    throw new Error('Study material not found or access denied.');
  }

  if (material.processingStatus !== 'completed') {
    throw new Error('Study material processing is not completed.');
  }

  return material;
};

// @desc Generate an AI diagram
// @route POST /api/diagrams/generate
const generateDiagramContent = async (req, res) => {
  try {
    const {
      subjectId,
      materialId,
      topic,
      diagramType,
      sourceText,
      additionalInstructions,
    } = req.body;

    if (!topic?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a topic.',
      });
    }

    await validateSubject(subjectId, getUserId(req));

    let extractedContent = sourceText?.trim() || null;

    if (materialId) {
      const material = await validateMaterial(
        materialId,
        subjectId,
        getUserId(req)
      );

      extractedContent = material.extractedContent;
    }

    if (!extractedContent) {
      return res.status(400).json({
        success: false,
        message: 'Provide source text or select a completed study material.',
      });
    }

    const result = await generateDiagram({
      extractedContent,
      topic: topic.trim(),
      diagramType: diagramType || 'flowchart',
      additionalInstructions: additionalInstructions || '',
    });

    return res.status(200).json({
      success: true,
      message: 'Diagram generated successfully.',
      data: result,
    });
  } catch (error) {
    console.error('[Diagram Generation Error]', error);

    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to generate diagram.',
    });
  }
};

// @desc Save a generated diagram
// @route POST /api/diagrams
const saveDiagram = async (req, res) => {
  try {
    const {
      subjectId,
      materialId,
      topic,
      title,
      diagramType,
      diagramSource,
      explanation,
    } = req.body;

    if (
      !subjectId ||
      !topic?.trim() ||
      !title?.trim() ||
      !diagramType ||
      !diagramSource?.trim() ||
      !explanation?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required diagram details.',
      });
    }

    await validateSubject(subjectId, getUserId(req));

    if (materialId) {
      await validateMaterial(materialId, subjectId, getUserId(req));
    }

    const savedDiagram = await Diagram.create({
      userId: getUserId(req),
      subjectId,
      materialId: materialId || null,
      topic: topic.trim(),
      title: title.trim(),
      diagramType,
      diagramSource: diagramSource.trim(),
      explanation: explanation.trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Diagram saved successfully.',
      data: savedDiagram,
    });
  } catch (error) {
    console.error('[Save Diagram Error]', error);

    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to save diagram.',
    });
  }
};

// @desc Get all saved diagrams belonging to the logged-in user
// @route GET /api/diagrams
const getDiagrams = async (req, res) => {
  try {
    const { subjectId, search, topic } = req.query;

    const filter = {
      userId: getUserId(req),
    };

    if (subjectId) {
      if (!validObjectId(subjectId)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid subject ID.',
        });
      }

      filter.subjectId = subjectId;
    }

    if (topic?.trim()) {
      const safeTopic = topic.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.topic = { $regex: safeTopic, $options: 'i' };
    }

    if (search?.trim()) {
      const safeSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      filter.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { topic: { $regex: safeSearch, $options: 'i' } },
        { explanation: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const diagrams = await Diagram.find(filter)
      .populate('subjectId', 'subjectName')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: diagrams.length,
      data: diagrams,
    });
  } catch (error) {
    console.error('[Get Diagrams Error]', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch diagrams.',
    });
  }
};

// @desc Get one saved diagram
// @route GET /api/diagrams/:id
const getDiagramById = async (req, res) => {
  try {
    if (!validObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid diagram ID.',
      });
    }

    const diagram = await Diagram.findOne({
      _id: req.params.id,
      userId: getUserId(req),
    }).populate('subjectId', 'subjectName');

    if (!diagram) {
      return res.status(404).json({
        success: false,
        message: 'Diagram not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: diagram,
    });
  } catch (error) {
    console.error('[Get Diagram Error]', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch diagram.',
    });
  }
};

// @desc Delete a saved diagram
// @route DELETE /api/diagrams/:id
const deleteDiagram = async (req, res) => {
  try {
    if (!validObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid diagram ID.',
      });
    }

    const diagram = await Diagram.findOneAndDelete({
      _id: req.params.id,
      userId: getUserId(req),
    });

    if (!diagram) {
      return res.status(404).json({
        success: false,
        message: 'Diagram not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Diagram deleted successfully.',
    });
  } catch (error) {
    console.error('[Delete Diagram Error]', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete diagram.',
    });
  }
};

module.exports = {
  generateDiagramContent,
  saveDiagram,
  getDiagrams,
  getDiagramById,
  deleteDiagram,
};
