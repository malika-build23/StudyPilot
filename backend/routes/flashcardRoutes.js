const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  generateFlashcards,
  createDeck,
  getDecks,
  getDeckById,
  deleteDeck,
  createFlashcard,
  updateFlashcard,
  deleteFlashcard,
} = require('../controllers/flashcardController');

// All routes require authenticated user
router.use(protect);

// Flashcard Generation
router.post('/generate', generateFlashcards);

// Deck Management
router.route('/decks')
  .get(getDecks)
  .post(createDeck);

router.route('/decks/:id')
  .get(getDeckById)
  .delete(deleteDeck);

// Individual Flashcard CRUD
router.post('/', createFlashcard);

router.route('/:id')
  .put(updateFlashcard)
  .delete(deleteFlashcard);

module.exports = router;
