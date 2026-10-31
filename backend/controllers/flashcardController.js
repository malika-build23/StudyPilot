const FlashcardDeck = require('../models/FlashcardDeck');
const Flashcard = require('../models/Flashcard');
const FlashcardReview = require('../models/FlashcardReview');
const Subject = require('../models/Subject');
const StudyMaterial = require('../models/StudyMaterial');
const { generateFlashcardCards } = require('../services/geminiService');

const getUserId = (req) => req.user._id;

// @desc    Generate flashcards using Gemini AI from study material
// @route   POST /api/flashcards/generate
// @access  Private
const generateFlashcards = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const {
      subjectId,
      materialId,
      deckId,
      deckTitle,
      chapter = '',
      topic = '',
      cardCount = 10,
      difficulty = 'MEDIUM',
    } = req.body;

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

    let material = null;
    let extractedContent = null;

    if (materialId) {
      material = await StudyMaterial.findOne({ _id: materialId, subjectId, userId });
      if (!material) {
        return res.status(404).json({
          success: false,
          message: 'Study material not found or does not belong to this subject.',
        });
      }

      if (material.processingStatus !== 'completed' || !material.extractedContent) {
        return res.status(400).json({
          success: false,
          message: 'Selected study material does not have processed text content yet.',
        });
      }

      extractedContent = material.extractedContent;
    } else {
      // Find latest processed material for this subject as fallback
      material = await StudyMaterial.findOne({
        subjectId,
        userId,
        processingStatus: 'completed',
      }).sort({ createdAt: -1 });

      if (material && material.extractedContent) {
        extractedContent = material.extractedContent;
      } else {
        return res.status(400).json({
          success: false,
          message:
            'Please select or upload a study material first so flashcards can be generated from actual course content.',
        });
      }
    }

    const count = Math.max(1, Math.min(30, parseInt(cardCount, 10) || 10));
    const normalizedDifficulty = ['EASY', 'MEDIUM', 'HARD'].includes(String(difficulty).toUpperCase())
      ? String(difficulty).toUpperCase()
      : 'MEDIUM';

    // Generate cards using existing Gemini service
    const generatedCards = await generateFlashcardCards(extractedContent, {
      fileName: material.fileName,
      cardCount: count,
      difficulty: normalizedDifficulty,
      chapter,
      topic,
    });

    // Determine deck to store cards in
    let deck;
    if (deckId) {
      deck = await FlashcardDeck.findOne({ _id: deckId, userId });
      if (!deck) {
        return res.status(404).json({
          success: false,
          message: 'Specified deck not found.',
        });
      }
    } else {
      const generatedTitle =
        deckTitle && deckTitle.trim()
          ? deckTitle.trim()
          : `${material.fileName.replace(/\.[^/.]+$/, '')} - ${chapter || 'Flashcards'}`;

      deck = await FlashcardDeck.create({
        userId,
        subjectId: subject._id,
        materialId: material._id,
        title: generatedTitle,
        chapter: chapter || 'General',
        description: `Generated with Gemini AI (${normalizedDifficulty} difficulty, ${generatedCards.length} cards)`,
        cardCount: 0,
      });
    }

    // Insert flashcards
    const cardsToInsert = generatedCards.map((card) => ({
      userId,
      deckId: deck._id,
      subjectId: subject._id,
      question: card.question,
      answer: card.answer,
      explanation: card.explanation || '',
      difficulty: card.difficulty || normalizedDifficulty,
      chapter: card.chapter || chapter || deck.chapter || 'General',
      topic: card.topic || topic || 'General',
      sourceReference: card.sourceReference || material.fileName || '',
    }));

    const insertedCards = await Flashcard.insertMany(cardsToInsert);

    // Update deck card count
    deck.cardCount = await Flashcard.countDocuments({ deckId: deck._id });
    await deck.save();

    return res.status(201).json({
      success: true,
      message: `Successfully generated ${insertedCards.length} flashcards.`,
      deck,
      flashcards: insertedCards,
    });
  } catch (error) {
    console.error('[Flashcard Controller - Generate Error]:', error);
    next(error);
  }
};

// @desc    Create a new flashcard deck manually
// @route   POST /api/flashcards/decks
// @access  Private
const createDeck = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { subjectId, materialId = null, title, chapter = 'General', description = '' } = req.body;

    if (!subjectId || !title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Subject ID and deck title are required.',
      });
    }

    const subject = await Subject.findOne({ _id: subjectId, userId });
    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found or you do not have permission to access it.',
      });
    }

    if (materialId) {
      const material = await StudyMaterial.findOne({ _id: materialId, subjectId, userId });
      if (!material) {
        return res.status(404).json({
          success: false,
          message: 'Specified study material not found in this subject.',
        });
      }
    }

    const deck = await FlashcardDeck.create({
      userId,
      subjectId,
      materialId: materialId || null,
      title: title.trim(),
      chapter: chapter.trim() || 'General',
      description: description.trim(),
      cardCount: 0,
    });

    return res.status(201).json({
      success: true,
      data: deck,
    });
  } catch (error) {
    console.error('[Flashcard Controller - Create Deck Error]:', error);
    next(error);
  }
};

// @desc    Get all decks for user (optional subject filter)
// @route   GET /api/flashcards/decks
// @access  Private
const getDecks = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { subjectId } = req.query;

    const query = { userId };
    if (subjectId) {
      query.subjectId = subjectId;
    }

    const decks = await FlashcardDeck.find(query)
      .populate('subjectId', 'subjectName semester')
      .populate('materialId', 'fileName')
      .sort({ updatedAt: -1 });

    return res.status(200).json({
      success: true,
      count: decks.length,
      data: decks,
    });
  } catch (error) {
    console.error('[Flashcard Controller - Get Decks Error]:', error);
    next(error);
  }
};

// @desc    Get single deck with all its flashcards
// @route   GET /api/flashcards/decks/:id
// @access  Private
const getDeckById = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const deck = await FlashcardDeck.findOne({ _id: id, userId })
      .populate('subjectId', 'subjectName semester')
      .populate('materialId', 'fileName');

    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard deck not found.',
      });
    }

    const flashcards = await Flashcard.find({ deckId: deck._id, userId }).sort({ createdAt: 1 });

    // Ensure card count is in sync
    if (deck.cardCount !== flashcards.length) {
      deck.cardCount = flashcards.length;
      await deck.save();
    }

    return res.status(200).json({
      success: true,
      deck,
      flashcards,
    });
  } catch (error) {
    console.error('[Flashcard Controller - Get Deck By ID Error]:', error);
    next(error);
  }
};

// @desc    Delete a deck and all its flashcards and review records
// @route   DELETE /api/flashcards/decks/:id
// @access  Private
const deleteDeck = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const deck = await FlashcardDeck.findOne({ _id: id, userId });
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard deck not found.',
      });
    }

    // Cascade delete cards and review tracking
    await Flashcard.deleteMany({ deckId: deck._id, userId });
    await FlashcardReview.deleteMany({ deckId: deck._id, userId });
    await FlashcardDeck.findByIdAndDelete(deck._id);

    return res.status(200).json({
      success: true,
      message: 'Flashcard deck and associated cards removed successfully.',
    });
  } catch (error) {
    console.error('[Flashcard Controller - Delete Deck Error]:', error);
    next(error);
  }
};

// @desc    Create an individual flashcard manually
// @route   POST /api/flashcards
// @access  Private
const createFlashcard = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const {
      deckId,
      question,
      answer,
      explanation = '',
      difficulty = 'MEDIUM',
      chapter = '',
      topic = '',
      sourceReference = '',
    } = req.body;

    if (!deckId || !question || !question.trim() || !answer || !answer.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Deck ID, question, and answer are required.',
      });
    }

    const deck = await FlashcardDeck.findOne({ _id: deckId, userId });
    if (!deck) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard deck not found.',
      });
    }

    const normalizedDifficulty = ['EASY', 'MEDIUM', 'HARD'].includes(String(difficulty).toUpperCase())
      ? String(difficulty).toUpperCase()
      : 'MEDIUM';

    const flashcard = await Flashcard.create({
      userId,
      deckId: deck._id,
      subjectId: deck.subjectId,
      question: question.trim(),
      answer: answer.trim(),
      explanation: explanation.trim(),
      difficulty: normalizedDifficulty,
      chapter: chapter.trim() || deck.chapter || 'General',
      topic: topic.trim() || 'General',
      sourceReference: sourceReference.trim(),
    });

    // Update deck card count
    deck.cardCount = await Flashcard.countDocuments({ deckId: deck._id });
    await deck.save();

    return res.status(201).json({
      success: true,
      data: flashcard,
    });
  } catch (error) {
    console.error('[Flashcard Controller - Create Flashcard Error]:', error);
    next(error);
  }
};

// @desc    Update an existing flashcard
// @route   PUT /api/flashcards/:id
// @access  Private
const updateFlashcard = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;
    const { question, answer, explanation, difficulty, chapter, topic, sourceReference } = req.body;

    const flashcard = await Flashcard.findOne({ _id: id, userId });
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found or you do not have permission to edit it.',
      });
    }

    if (question !== undefined) flashcard.question = question.trim();
    if (answer !== undefined) flashcard.answer = answer.trim();
    if (explanation !== undefined) flashcard.explanation = explanation.trim();
    if (difficulty !== undefined) {
      const normalizedDiff = ['EASY', 'MEDIUM', 'HARD'].includes(String(difficulty).toUpperCase())
        ? String(difficulty).toUpperCase()
        : flashcard.difficulty;
      flashcard.difficulty = normalizedDiff;
    }
    if (chapter !== undefined) flashcard.chapter = chapter.trim();
    if (topic !== undefined) flashcard.topic = topic.trim();
    if (sourceReference !== undefined) flashcard.sourceReference = sourceReference.trim();

    await flashcard.save();

    return res.status(200).json({
      success: true,
      message: 'Flashcard updated successfully.',
      data: flashcard,
    });
  } catch (error) {
    console.error('[Flashcard Controller - Update Flashcard Error]:', error);
    next(error);
  }
};

// @desc    Delete a single flashcard
// @route   DELETE /api/flashcards/:id
// @access  Private
const deleteFlashcard = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { id } = req.params;

    const flashcard = await Flashcard.findOne({ _id: id, userId });
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found.',
      });
    }

    const deckId = flashcard.deckId;

    // Delete card and any review record
    await Flashcard.findByIdAndDelete(flashcard._id);
    await FlashcardReview.deleteMany({ flashcardId: flashcard._id, userId });

    // Decrement deck card count
    const remainingCount = await Flashcard.countDocuments({ deckId });
    await FlashcardDeck.findByIdAndUpdate(deckId, { cardCount: remainingCount });

    return res.status(200).json({
      success: true,
      message: 'Flashcard deleted successfully.',
    });
  } catch (error) {
    console.error('[Flashcard Controller - Delete Flashcard Error]:', error);
    next(error);
  }
};

module.exports = {
  generateFlashcards,
  createDeck,
  getDecks,
  getDeckById,
  deleteDeck,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
};
