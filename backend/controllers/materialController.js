
const crypto = require('crypto');
const path = require('path');
const StudyMaterial = require('../models/StudyMaterial');
const Subject = require('../models/Subject');
const { supabase, bucketName } = require('../config/storage');
const { processDocument } = require('../services/documentProcessor');

const getUserId = (req) => req.user._id;

const uploadMaterial = async (req, res, next) => {
  let storagePath;

  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please select a file.' });
    }

    const { subjectId } = req.body;

    if (!subjectId) {
      return res.status(400).json({ message: 'Subject ID is required.' });
    }

    const subject = await Subject.findOne({
      _id: subjectId,
      userId: getUserId(req),
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found.' });
    }

    const extension = path.extname(req.file.originalname).toLowerCase();
    const fileType = extension.slice(1);

    storagePath = `${getUserId(req)}/${subjectId}/${crypto.randomUUID()}${extension}`;

    const { error: storageError } = await supabase.storage
      .from(bucketName)
      .upload(storagePath, req.file.buffer, {
        contentType: req.file.mimetype,
        upsert: false,
      });

    if (storageError) {
      throw storageError;
    }

    const extractedContent = await processDocument(
      req.file.buffer,
      fileType
    );

    const material = await StudyMaterial.create({
      userId: getUserId(req),
      subjectId,
      fileName: req.file.originalname,
      storagePath,
      fileType,
      fileSize: req.file.size,
      extractedContent,
      processingStatus: 'completed',
      ocrRequired: extractedContent.ocrRequired,
    });

    return res.status(201).json({
      message: 'Study material uploaded and processed successfully.',
      material,
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

const getMaterialsBySubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.subjectId,
      userId: getUserId(req),
    });

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found.' });
    }

    const materials = await StudyMaterial.find({
      subjectId: subject._id,
      userId: getUserId(req),
    }).sort({ createdAt: -1 });

    return res.status(200).json({ materials });
  } catch (error) {
    next(error);
  }
};

const getMaterialById = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findOne({
      _id: req.params.id,
      userId: getUserId(req),
    });

    if (!material) {
      return res.status(404).json({ message: 'Study material not found.' });
    }

    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(material.storagePath, 60 * 10);

    if (error) {
      throw error;
    }

    return res.status(200).json({
      material,
      signedUrl: data.signedUrl,
    });
  } catch (error) {
    next(error);
  }
};

const deleteMaterial = async (req, res, next) => {
  try {
    const material = await StudyMaterial.findOne({
      _id: req.params.id,
      userId: getUserId(req),
    });

    if (!material) {
      return res.status(404).json({ message: 'Study material not found.' });
    }

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([material.storagePath]);

    if (error) {
      throw error;
    }

    await material.deleteOne();

    return res.status(200).json({
      message: 'Study material deleted successfully.',
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
