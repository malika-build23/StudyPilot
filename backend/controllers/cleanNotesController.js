const crypto = require('crypto');
const path = require('path');
const CleanNote = require('../models/CleanNote');
const Subject = require('../models/Subject');
const { supabase, bucketName } = require('../config/storage');
const { processDocument } = require('../services/documentProcessor');
const { structureCleanNotes } = require('../services/geminiService');

const getUserId = (req) => req.user._id;

// Helper to attach signed URLs to original note files
const attachSignedUrls = async (cleanNote) => {
  const plain = cleanNote.toObject ? cleanNote.toObject() : { ...cleanNote };
  if (!Array.isArray(plain.originalFiles)) return plain;

  plain.originalFiles = await Promise.all(
    plain.originalFiles.map(async (file) => {
      try {
        const { data } = await supabase.storage
          .from(bucketName)
          .createSignedUrl(file.storagePath, 3600);
        return {
          ...file,
          fileUrl: data?.signedUrl || null,
        };
      } catch (err) {
        return { ...file, fileUrl: null };
      }
    })
  );

  return plain;
};

// @desc    Upload handwritten notes (images or PDF) and convert to clean structured notes
// @route   POST /api/clean-notes/upload
// @access  Private
const uploadAndProcessNotes = async (req, res, next) => {
  const uploadedStoragePaths = [];

  try {
    const userId = getUserId(req);
    const { subjectId, title, chapter = '' } = req.body;

    if (!subjectId) {
      return res.status(400).json({
        success: false,
        message: 'Subject ID is required.',
      });
    }

    const subject = await Subject.findOne({ _id: subjectId, userId });
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found or you do not have permission to access it.',
      });
    }

    const files = req.files || (req.file ? [req.file] : []);
    if (files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please upload at least one image (JPG, PNG) or PDF handwritten note file.',
      });
    }

    const noteTitle =
      title && title.trim()
        ? title.trim()
        : `${files[0].originalname.replace(/\.[^/.]+$/, '')} - Clean Notes`;

    const originalFiles = [];
    const imageParts = [];
    let accumulatedText = '';

    // Upload each file to Supabase and prepare OCR / multimodal buffers
    for (const file of files) {
      const ext = path.extname(file.originalname).toLowerCase();
      const storagePath = `${userId}/cleannotes/${crypto.randomUUID()}${ext}`;

      const { error: storageError } = await supabase.storage
        .from(bucketName)
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: false,
        });

      if (storageError) {
        console.error('[Supabase Clean Note Upload Error]:', storageError);
        throw new Error(`Failed to upload file ${file.originalname}: ${storageError.message}`);
      }

      uploadedStoragePaths.push(storagePath);

      originalFiles.push({
        fileName: file.originalname,
        storagePath,
        fileType: ext.replace('.', ''),
        fileSize: file.size,
      });

      // Prepare extraction strategy
      if (ext === '.pdf') {
        let extractedPdfText = '';
        try {
          const doc = await processDocument(file.buffer, 'pdf');
          if (Array.isArray(doc.pages) && doc.pages.some((p) => p.text && p.text.trim().length > 15)) {
            extractedPdfText = doc.pages.map((p) => `--- PAGE ${p.pageNumber} ---\n${p.text}`).join('\n\n');
          }
        } catch (pdfErr) {
          console.warn('[Clean Notes]: PDF text extraction fallback to multimodal OCR', pdfErr.message);
        }

        if (extractedPdfText.trim().length > 30) {
          accumulatedText += `\n\n[File: ${file.originalname}]\n` + extractedPdfText;
        } else {
          // Scanned PDF -> send buffer as multimodal PDF to Gemini
          imageParts.push({
            mimeType: 'application/pdf',
            base64: file.buffer.toString('base64'),
          });
        }
      } else {
        // Image format (.jpg, .jpeg, .png) -> add as multimodal image
        imageParts.push({
          mimeType: file.mimetype || 'image/jpeg',
          base64: file.buffer.toString('base64'),
        });
      }
    }

    // Create CleanNote in processing state
    const cleanNote = await CleanNote.create({
      userId,
      subjectId: subject._id,
      title: noteTitle,
      chapter: chapter.trim() || 'General',
      originalFiles,
      extractedText: accumulatedText.trim(),
      processingStatus: 'processing',
    });

    // Run AI structuring with Gemini
    let structuredResult;
    try {
      structuredResult = await structureCleanNotes(accumulatedText, imageParts, {
        subjectName: subject.subjectName,
        chapterTitle: chapter || cleanNote.title,
        originalFileName: files.map((f) => f.originalname).join(', '),
      });
    } catch (aiErr) {
      cleanNote.processingStatus = 'failed';
      cleanNote.errorMessage = aiErr.message;
      await cleanNote.save();
      throw aiErr;
    }

    cleanNote.extractedText = structuredResult.rawOcrText || cleanNote.extractedText || 'OCR text extracted from notes.';
    cleanNote.structuredContent = structuredResult;
    cleanNote.editedContent = structuredResult; // Default initial copy for student to edit
    cleanNote.processingStatus = 'completed';
    await cleanNote.save();

    const resultWithUrls = await attachSignedUrls(cleanNote);

    return res.status(201).json({
      success: true,
      message: 'Handwritten notes successfully transcribed and structured.',
      data: resultWithUrls,
    });
  } catch (error) {
    console.error('[Clean Notes Controller - Upload Error]:', error);
    next(error);
  }
};

// @desc    Get all clean notes for user (optional subject filter and search)
// @route   GET /api/clean-notes
// @access  Private
const getNotes = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { subjectId, search } = req.query;

    const query = { userId };
    if (subjectId) query.subjectId = subjectId;
    if (search && search.trim()) {
      query.$or = [
        { title: { $regex: search.trim(), $options: 'i' } },
        { chapter: { $regex: search.trim(), $options: 'i' } },
      ];
    }

    const notes = await CleanNote.find(query)
      .populate('subjectId', 'subjectName semester')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    console.error('[Clean Notes Controller - Get Notes Error]:', error);
    next(error);
  }
};

// @desc    Get single clean note with signed original file URLs
// @route   GET /api/clean-notes/:id
// @access  Private
const getNoteById = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const cleanNote = await CleanNote.findOne({ _id: id, userId }).populate(
      'subjectId',
      'subjectName semester'
    );

    if (!cleanNote) {
      return res.status(404).json({
        success: false,
        message: 'Clean note not found.',
      });
    }

    const noteWithUrls = await attachSignedUrls(cleanNote);

    return res.status(200).json({
      success: true,
      data: noteWithUrls,
    });
  } catch (error) {
    console.error('[Clean Notes Controller - Get Note By ID Error]:', error);
    next(error);
  }
};

// @desc    Update clean note title, chapter, or student-edited content
// @route   PUT /api/clean-notes/:id
// @access  Private
const updateNote = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { title, chapter, editedContent } = req.body;

    const cleanNote = await CleanNote.findOne({ _id: id, userId });
    if (!cleanNote) {
      return res.status(404).json({
        success: false,
        message: 'Clean note not found or you do not have permission to edit it.',
      });
    }

    if (title !== undefined) cleanNote.title = title.trim();
    if (chapter !== undefined) cleanNote.chapter = chapter.trim();
    if (editedContent !== undefined) {
      cleanNote.editedContent = editedContent;
    }

    await cleanNote.save();

    return res.status(200).json({
      success: true,
      message: 'Note changes saved successfully.',
      data: cleanNote,
    });
  } catch (error) {
    console.error('[Clean Notes Controller - Update Note Error]:', error);
    next(error);
  }
};

// @desc    Reprocess note through AI structuring
// @route   POST /api/clean-notes/:id/process
// @access  Private
const processNote = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const cleanNote = await CleanNote.findOne({ _id: id, userId }).populate(
      'subjectId',
      'subjectName'
    );

    if (!cleanNote) {
      return res.status(404).json({
        success: false,
        message: 'Clean note not found.',
      });
    }

    cleanNote.processingStatus = 'processing';
    await cleanNote.save();

    const structuredResult = await structureCleanNotes(
      cleanNote.extractedText || '',
      [],
      {
        subjectName: cleanNote.subjectId?.subjectName || 'Course Notes',
        chapterTitle: cleanNote.chapter || cleanNote.title,
      }
    );

    cleanNote.structuredContent = structuredResult;
    if (!cleanNote.editedContent) {
      cleanNote.editedContent = structuredResult;
    }
    cleanNote.processingStatus = 'completed';
    await cleanNote.save();

    return res.status(200).json({
      success: true,
      message: 'Clean note reprocessed successfully.',
      data: cleanNote,
    });
  } catch (error) {
    console.error('[Clean Notes Controller - Process Note Error]:', error);
    next(error);
  }
};

// @desc    Export clean note as printable HTML / PDF view or JSON
// @route   GET /api/clean-notes/:id/export
// @access  Private
const exportNote = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { format = 'html' } = req.query;

    const cleanNote = await CleanNote.findOne({ _id: id, userId }).populate(
      'subjectId',
      'subjectName semester'
    );

    if (!cleanNote) {
      return res.status(404).json({
        success: false,
        message: 'Clean note not found.',
      });
    }

    const content = cleanNote.editedContent || cleanNote.structuredContent || {};

    if (format === 'json') {
      return res.json({
        success: true,
        data: {
          title: cleanNote.title,
          subject: cleanNote.subjectId?.subjectName,
          content,
        },
      });
    }

    // Render print-ready academic HTML with KaTeX and clean typography
    const headingsHtml = Array.isArray(content.headings)
      ? content.headings
          .map(
            (h) => `
        <div class="heading-block">
          <h2>${h.title || 'Section'}</h2>
          ${h.content ? `<p>${h.content}</p>` : ''}
          ${
            Array.isArray(h.subheadings)
              ? h.subheadings
                  .map(
                    (sub) => `
                <div class="subheading-block">
                  <h3>${sub.title || 'Topic'}</h3>
                  <p>${sub.content || ''}</p>
                </div>
              `
                  )
                  .join('')
              : ''
          }
        </div>
      `
          )
          .join('')
      : '';

    const definitionsHtml = Array.isArray(content.definitions) && content.definitions.length > 0
      ? `
      <div class="section-box">
        <h2>Important Definitions</h2>
        <dl>
          ${content.definitions
            .map(
              (d) => `
            <dt><strong>${d.term}:</strong></dt>
            <dd>${d.definition}</dd>
          `
            )
            .join('')}
        </dl>
      </div>
    `
      : '';

    const formulasHtml = Array.isArray(content.formulas) && content.formulas.length > 0
      ? `
      <div class="section-box">
        <h2>Key Formulas & Theorems</h2>
        ${content.formulas
          .map(
            (f) => `
          <div class="formula-item">
            <span class="formula-name"><strong>${f.name}</strong></span>
            <div class="formula-math">${f.expression}</div>
            ${f.explanation ? `<div class="formula-desc">${f.explanation}</div>` : ''}
          </div>
        `
          )
          .join('')}
      </div>
    `
      : '';

    const keyPointsHtml = Array.isArray(content.keyPoints) && content.keyPoints.length > 0
      ? `
      <div class="section-box">
        <h2>High-Yield Key Points</h2>
        <ul>
          ${content.keyPoints.map((pt) => `<li>${pt}</li>`).join('')}
        </ul>
      </div>
    `
      : '';

    const htmlDoc = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${cleanNote.title} - StudyPilot AI</title>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.8/dist/katex.min.css">
        <style>
          @page { margin: 20mm; size: A4; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
            color: #1e293b;
            line-height: 1.6;
            margin: 0;
            padding: 24px;
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            border-bottom: 2px solid #2563eb;
            padding-bottom: 12px;
            margin-bottom: 24px;
          }
          .header h1 {
            color: #0f172a;
            font-size: 26px;
            margin: 0 0 6px 0;
          }
          .meta {
            font-size: 13px;
            color: #64748b;
          }
          .badge {
            display: inline-block;
            background: #dbeafe;
            color: #1d4ed8;
            font-weight: 600;
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 11px;
            margin-right: 8px;
          }
          .heading-block {
            margin-top: 20px;
          }
          h2 {
            color: #1e3a8a;
            font-size: 18px;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 4px;
            margin-top: 16px;
          }
          h3 {
            color: #334155;
            font-size: 15px;
            margin-top: 12px;
          }
          .section-box {
            background: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 16px;
            margin: 20px 0;
          }
          .formula-item {
            background: #ffffff;
            border: 1px solid #cbd5e1;
            padding: 10px 14px;
            border-radius: 6px;
            margin-bottom: 10px;
          }
          .formula-math {
            font-size: 16px;
            color: #1d4ed8;
            margin: 6px 0;
          }
          .formula-desc {
            font-size: 12px;
            color: #64748b;
          }
          ul {
            padding-left: 20px;
          }
          li {
            margin-bottom: 6px;
          }
          .print-btn {
            background: #2563eb;
            color: #fff;
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 20px;
          }
          @media print {
            .print-btn { display: none; }
          }
        </style>
      </head>
      <body>
        <button class="print-btn" onclick="window.print()">Print / Save as PDF</button>
        <div class="header">
          <span class="badge">StudyPilot AI Clean Notes</span>
          <h1>${cleanNote.title}</h1>
          <div class="meta">
            <strong>Subject:</strong> ${cleanNote.subjectId?.subjectName || 'General'} |
            <strong>Chapter:</strong> ${cleanNote.chapter || 'Overview'} |
            <strong>Generated:</strong> ${new Date(cleanNote.createdAt).toLocaleDateString()}
          </div>
        </div>

        ${headingsHtml}
        ${definitionsHtml}
        ${formulasHtml}
        ${keyPointsHtml}
      </body>
      </html>
    `;

    res.setHeader('Content-Type', 'text/html');
    return res.send(htmlDoc);
  } catch (error) {
    console.error('[Clean Notes Controller - Export Error]:', error);
    next(error);
  }
};

// @desc    Delete clean note and remove original files from Supabase
// @route   DELETE /api/clean-notes/:id
// @access  Private
const deleteNote = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const cleanNote = await CleanNote.findOne({ _id: id, userId });
    if (!cleanNote) {
      return res.status(404).json({
        success: false,
        message: 'Clean note not found.',
      });
    }

    // Clean up files in Supabase Storage
    if (Array.isArray(cleanNote.originalFiles) && cleanNote.originalFiles.length > 0) {
      const pathsToRemove = cleanNote.originalFiles
        .map((f) => f.storagePath)
        .filter(Boolean);
      if (pathsToRemove.length > 0) {
        await supabase.storage.from(bucketName).remove(pathsToRemove).catch((err) => {
          console.warn('[Clean Notes Supabase Cleanup Warning]:', err.message);
        });
      }
    }

    await CleanNote.findByIdAndDelete(cleanNote._id);

    return res.status(200).json({
      success: true,
      message: 'Clean note deleted successfully.',
    });
  } catch (error) {
    console.error('[Clean Notes Controller - Delete Error]:', error);
    next(error);
  }
};

module.exports = {
  uploadAndProcessNotes,
  getNotes,
  getNoteById,
  updateNote,
  processNote,
  exportNote,
  deleteNote,
};
