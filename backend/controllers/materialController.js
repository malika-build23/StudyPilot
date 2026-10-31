const crypto = require('crypto');
const path = require('path');
const StudyMaterial = require('../models/StudyMaterial');
const Subject = require('../models/Subject');
const { supabase, bucketName } = require('../config/storage');
const { processDocument } = require('../services/documentProcessor');

const getUserId = (req) => req.user._id;

// Helper to attach signed URL
const attachSignedUrl = async (material, expiresInSeconds = 3600) => {
  const plain = material.toObject ? material.toObject() : { ...material };
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

// @desc    Upload study material and extract content
// @route   POST /api/materials/upload
// @access  Private
const uploadMaterial = async (req, res, next) => {
  let storagePath;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'Please select a document file to upload.',
      });
    }

    const { subjectId } = req.body;

    if (!subjectId) {
      return res.status(400).json({
        success: false,
        message: 'Subject ID is required.',
      });
    }

    const subject = await Subject.findOne({
      _id: subjectId,
      userId: getUserId(req),
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found or you do not have permission to upload to it.',
      });
    }

    const extension = path.extname(req.file.originalname).toLowerCase();
    const fileType = extension.slice(1);

    storagePath = `${getUserId(req)}/${subjectId}/${crypto.randomUUID()}${extension}`;

    // Upload to Supabase Storage
    const { error: storageError } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (storageError) {
      throw storageError;
    }

    // Extract text content from PDF / PPTX
    let extractedContent;
    try {
      extractedContent = await processDocument(req.file.buffer, fileType);
    } catch (parseError) {
      console.error('[Document Extraction Error]:', parseError);
      // Clean up uploaded file if extraction fails
      await supabase.storage.from(bucketName).remove([storagePath]).catch(() => {});
      return res.status(422).json({
        success: false,
        message: `Unable to extract content from ${req.file.originalname}: ${parseError.message}`,
      });
    }

    const material = await StudyMaterial.create({
      userId: getUserId(req),
      subjectId,
      fileName: req.file.originalname,
      storagePath,
      fileType,
      fileSize: req.file.size,
      extractedContent,
      processingStatus: 'completed',
      ocrRequired: !!extractedContent.ocrRequired,
    });

    const materialWithUrl = await attachSignedUrl(material);

    return res.status(201).json({
      success: true,
      message: 'Study material uploaded and processed successfully.',
      data: materialWithUrl,
      material: materialWithUrl,
    });
  } catch (error) {
    if (storagePath) {
      await supabase.storage
        .from(bucketName)
        .remove([storagePath])
        .catch(() => {});
    }

    next(error);
  }
};

// @desc    Get all study materials for a subject
// @route   GET /api/materials/subject/:subjectId
// @access  Private
const getMaterialsBySubject = async (req, res, next) => {
  try {
    const subjectId = req.params.subjectId || req.params.id;

    const subject = await Subject.findOne({
      _id: subjectId,
      userId: getUserId(req),
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found or you do not have permission to view its materials.',
      });
    }

    const materials = await StudyMaterial.find({
      subjectId: subject._id,
      userId: getUserId(req),
    }).sort({ createdAt: -1 });

    const materialsWithUrls = await Promise.all(
      materials.map((m) => attachSignedUrl(m))
    );

    return res.status(200).json({
      success: true,
      count: materialsWithUrls.length,
      data: materialsWithUrls,
      materials: materialsWithUrls,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single study material by ID
// @route   GET /api/materials/:id
// @access  Private
const getMaterialById = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findOne({
      _id: req.params.id,
      userId: getUserId(req),
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found or you do not have permission to access it.',
      });
    }

    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(material.storagePath, 60 * 60);

    if (error) {
      throw error;
    }

    const obj = material.toObject();
    obj.fileUrl = data.signedUrl;

    return res.status(200).json({
      success: true,
      data: obj,
      material: obj,
      signedUrl: data.signedUrl,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete study material
// @route   DELETE /api/materials/:id
// @access  Private
const deleteMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findOne({
      _id: req.params.id,
      userId: getUserId(req),
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found or you do not have permission to delete it.',
      });
    }

    // Remove from cloud storage
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([material.storagePath]);

    if (error) {
      console.warn('[Storage Delete Warning]:', error.message);
    }

    await material.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Study material deleted successfully.',
      data: { id: req.params.id },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadMaterial,
  getMaterialsBySubject,
  getMaterialById,
  deleteMaterial,
};
