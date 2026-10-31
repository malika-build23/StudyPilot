
const mongoose = require('mongoose');
const Mnemonic = require('../models/Mnemonic');
const Subject = require('../models/Subject');
const StudyMaterial = require('../models/StudyMaterial');
const { generateMnemonic } = require('../services/geminiService');

const getUserId = (req) => req.user._id;

const validObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

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

// @desc Generate a mnemonic using AI
// @route POST /api/mnemonics/generate
const generateMnemonicContent = async (req, res) => {
  try {
    const {
      subjectId,
      materialId,
      topic,
      technique,
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

    const result = await generateMnemonic({
      extractedContent,
      topic: topic.trim(),
      technique: technique || 'acronym',
      additionalInstructions: additionalInstructions || '',
    });

    return res.status(200).json({
      success: true,
      message: 'Mnemonic generated successfully.',
      data: result,
    });
  } catch (error) {
    console.error('[Mnemonic Generation Error]', error);

    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to generate mnemonic.',
    });
  }
};

// @desc Save a generated mnemonic
// @route POST /api/mnemonics
const saveMnemonic = async (req, res) => {
  try {
    const {
      subjectId,
      materialId,
      topic,
      title,
      technique,
      mnemonic,
      explanation,
      letterMapping,
      originalConcept,
      example,

      // New visual-memory fields
      visualAssociations,
      memoryChart,
      diagram,
      storyScenes,
      recallQuestions,
    } = req.body;

    if (
      !subjectId ||
      !topic?.trim() ||
      !title?.trim() ||
      !technique ||
      !mnemonic?.trim() ||
      !explanation?.trim() ||
      !originalConcept?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required mnemonic details.',
      });
    }

    await validateSubject(subjectId, getUserId(req));

    if (materialId) {
      await validateMaterial(materialId, subjectId, getUserId(req));
    }

    const savedMnemonic = await Mnemonic.create({
      userId: getUserId(req),
      subjectId,
      materialId: materialId || null,
      topic: topic.trim(),
      title: title.trim(),
      technique,
      mnemonic: mnemonic.trim(),
      explanation: explanation.trim(),
      letterMapping: letterMapping || null,
      originalConcept: originalConcept.trim(),
      example: example || '',

      // Save visual-memory content
      visualAssociations: Array.isArray(visualAssociations)
        ? visualAssociations
        : [],

      memoryChart: Array.isArray(memoryChart)
        ? memoryChart
        : [],

      diagram: diagram || {
        type: 'concept-map',
        source: '',
        explanation: '',
      },

      storyScenes: Array.isArray(storyScenes)
        ? storyScenes
        : [],

      recallQuestions: Array.isArray(recallQuestions)
        ? recallQuestions
        : [],
    });

    return res.status(201).json({
      success: true,
      message: 'Mnemonic saved successfully.',
      data: savedMnemonic,
    });
  } catch (error) {
    console.error('[Save Mnemonic Error]', error);

    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to save mnemonic.',
    });
  }
};

// @desc Get all mnemonics belonging to the logged-in user
// @route GET /api/mnemonics
const getMnemonics = async (req, res) => {
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
      filter.topic = {
        $regex: escapeRegex(topic.trim()),
        $options: 'i',
      };
    }

    if (search?.trim()) {
      const safeSearch = escapeRegex(search.trim());

      filter.$or = [
        { title: { $regex: safeSearch, $options: 'i' } },
        { topic: { $regex: safeSearch, $options: 'i' } },
        { mnemonic: { $regex: safeSearch, $options: 'i' } },
      ];
    }

    const mnemonics = await Mnemonic.find(filter)
      .populate('subjectId', 'subjectName')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: mnemonics.length,
      data: mnemonics,
    });
  } catch (error) {
    console.error('[Get Mnemonics Error]', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch mnemonics.',
    });
  }
};

// @desc Get one saved mnemonic
// @route GET /api/mnemonics/:id
const getMnemonicById = async (req, res) => {
  try {
    if (!validObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mnemonic ID.',
      });
    }

    const mnemonic = await Mnemonic.findOne({
      _id: req.params.id,
      userId: getUserId(req),
    }).populate('subjectId', 'subjectName');

    if (!mnemonic) {
      return res.status(404).json({
        success: false,
        message: 'Mnemonic not found.',
      });
    }

    return res.status(200).json({
      success: true,
      data: mnemonic,
    });
  } catch (error) {
    console.error('[Get Mnemonic Error]', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to fetch mnemonic.',
    });
  }
};

// @desc Update a saved mnemonic
// @route PUT /api/mnemonics/:id
const updateMnemonic = async (req, res) => {
  try {
    if (!validObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mnemonic ID.',
      });
    }

    const allowedFields = [
      'topic',
      'title',
      'technique',
      'mnemonic',
      'explanation',
      'letterMapping',
      'originalConcept',
      'example',

      // New visual-memory fields
      'visualAssociations',
      'memoryChart',
      'diagram',
      'storyScenes',
      'recallQuestions',
    ];

    const updates = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid fields provided for update.',
      });
    }

    const updatedMnemonic = await Mnemonic.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: getUserId(req),
      },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedMnemonic) {
      return res.status(404).json({
        success: false,
        message: 'Mnemonic not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Mnemonic updated successfully.',
      data: updatedMnemonic,
    });
  } catch (error) {
    console.error('[Update Mnemonic Error]', error);

    return res.status(400).json({
      success: false,
      message: error.message || 'Failed to update mnemonic.',
    });
  }
};

// @desc Delete a saved mnemonic
// @route DELETE /api/mnemonics/:id
const deleteMnemonic = async (req, res) => {
  try {
    if (!validObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid mnemonic ID.',
      });
    }

    const mnemonic = await Mnemonic.findOneAndDelete({
      _id: req.params.id,
      userId: getUserId(req),
    });

    if (!mnemonic) {
      return res.status(404).json({
        success: false,
        message: 'Mnemonic not found.',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Mnemonic deleted successfully.',
    });
  } catch (error) {
    console.error('[Delete Mnemonic Error]', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to delete mnemonic.',
    });
  }
};

module.exports = {
  generateMnemonicContent,
  saveMnemonic,
  getMnemonics,
  getMnemonicById,
  updateMnemonic,
  deleteMnemonic,
};
