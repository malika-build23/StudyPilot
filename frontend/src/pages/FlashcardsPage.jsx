import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { flashcardsAPI, subjectsAPI } from '../services/api';
import DeckDetailView from '../components/flashcards/DeckDetailView';
import FlashcardGeneratorModal from '../components/flashcards/FlashcardGeneratorModal';
import {
  Sparkles,
  Plus,
  BookOpen,
  Layers,
  Calendar,
  Trash2,
  Play,
  Loader2,
  FolderPlus,
  X
} from 'lucide-react';

const FlashcardsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const initialSubjectId = searchParams.get('subject') || '';

  const [decks, setDecks] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectId);
  const [loading, setLoading] = useState(true);

  // Active Deck View
  const [activeDeck, setActiveDeck] = useState(null);
  const [activeDeckCards, setActiveDeckCards] = useState([]);
  const [loadingDeck, setLoadingDeck] = useState(false);

  // Modals
  const [generatorModalOpen, setGeneratorModalOpen] = useState(false);
  const [createDeckModalOpen, setCreateDeckModalOpen] = useState(false);

  // New deck form
  const [newDeckTitle, setNewDeckTitle] = useState('');
  const [newDeckChapter, setNewDeckChapter] = useState('');
  const [newDeckDesc, setNewDeckDesc] = useState('');
  const [isCreatingDeck, setIsCreatingDeck] = useState(false);

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await subjectsAPI.getAll();
        if (res.data?.success) {
          setSubjects(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch decks
  const fetchDecks = async () => {
    try {
      setLoading(true);
      const params = selectedSubjectId ? { subjectId: selectedSubjectId } : {};
      const res = await flashcardsAPI.getDecks(params);
      if (res.data?.success) {
        setDecks(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch flashcard decks:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDecks();
  }, [selectedSubjectId]);

  // Load single deck
  const handleSelectDeck = async (deckId) => {
    try {
      setLoadingDeck(true);
      const res = await flashcardsAPI.getDeckById(deckId);
      if (res.data?.success) {
        setActiveDeck(res.data.deck);
        setActiveDeckCards(res.data.flashcards || []);
      }
    } catch (err) {
      console.error('Failed to load deck:', err);
      alert('Failed to load flashcard deck.');
    } finally {
      setLoadingDeck(false);
    }
  };

  const handleCreateDeckSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubjectId && subjects.length === 0) {
      alert('Please create a subject first.');
      return;
    }

    try {
      setIsCreatingDeck(true);
      const subjId = selectedSubjectId || subjects[0]._id;
      const res = await flashcardsAPI.createDeck({
        subjectId: subjId,
        title: newDeckTitle.trim(),
        chapter: newDeckChapter.trim() || 'General',
        description: newDeckDesc.trim(),
      });

      if (res.data?.success) {
        setCreateDeckModalOpen(false);
        setNewDeckTitle('');
        setNewDeckChapter('');
        setNewDeckDesc('');
        fetchDecks();
      }
    } catch (err) {
      console.error('Failed to create deck:', err);
      alert(err.response?.data?.message || 'Failed to create deck.');
    } finally {
      setIsCreatingDeck(false);
    }
  };

  const handleDeleteDeck = async (deckId) => {
    if (!window.confirm('Are you sure you want to delete this deck and all its flashcards?')) {
      return;
    }

    try {
      await flashcardsAPI.deleteDeck(deckId);
      setActiveDeck(null);
      fetchDecks();
    } catch (err) {
      console.error('Failed to delete deck:', err);
      alert('Failed to delete deck.');
    }
  };

  const handleAddCardToDeck = async (cardData) => {
    try {
      const res = await flashcardsAPI.createCard(cardData);
      if (res.data?.success) {
        setActiveDeckCards((prev) => [...prev, res.data.data]);
        fetchDecks();
      }
    } catch (err) {
      console.error('Failed to add card:', err);
      alert(err.response?.data?.message || 'Failed to add card.');
    }
  };

  const handleUpdateCardInDeck = async (cardId, cardData) => {
    try {
      const res = await flashcardsAPI.updateCard(cardId, cardData);
      if (res.data?.success) {
        setActiveDeckCards((prev) =>
          prev.map((c) => (c._id === cardId ? res.data.data : c))
        );
      }
    } catch (err) {
      console.error('Failed to update card:', err);
      alert('Failed to update card.');
    }
  };

  const handleDeleteCardInDeck = async (cardId) => {
    try {
      await flashcardsAPI.deleteCard(cardId);
      setActiveDeckCards((prev) => prev.filter((c) => c._id !== cardId));
      fetchDecks();
    } catch (err) {
      console.error('Failed to delete card:', err);
      alert('Failed to delete card.');
    }
  };

  const handleStartRevisionForDeck = (deckId) => {
    navigate(`/revision?deck=${deckId}`);
  };

  if (loadingDeck) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs text-slate-500 font-medium">Opening flashcard deck...</p>
      </div>
    );
  }

  // Active Deck View
  if (activeDeck) {
    return (
      <DeckDetailView
        deck={activeDeck}
        flashcards={activeDeckCards}
        onBack={() => setActiveDeck(null)}
        onAddCard={handleAddCardToDeck}
        onUpdateCard={handleUpdateCardInDeck}
        onDeleteCard={handleDeleteCardInDeck}
        onDeleteDeck={handleDeleteDeck}
        onOpenGenerator={() => setGeneratorModalOpen(true)}
        onStartRevision={handleStartRevisionForDeck}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              AI Flashcards
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700">
              Active Recall
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Generate active-recall flashcard decks from your course materials using Gemini AI
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCreateDeckModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-colors shadow-xs"
          >
            <FolderPlus className="w-4 h-4 text-blue-600" />
            <span>Create Deck</span>
          </button>

          <button
            onClick={() => setGeneratorModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs shadow-blue-500/25 transition-all hover:scale-102"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate with AI</span>
          </button>
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedSubjectId('')}
          className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
            selectedSubjectId === ''
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          All Subjects ({decks.length})
        </button>

        {subjects.map((sub) => (
          <button
            key={sub._id}
            onClick={() => setSelectedSubjectId(sub._id)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
              selectedSubjectId === sub._id
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {sub.subjectName}
          </button>
        ))}
      </div>

      {/* Decks Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs text-slate-500">Loading flashcard decks...</p>
        </div>
      ) : decks.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-slate-200/80 text-center shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Flashcard Decks Found</h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
            Create interactive flashcards from your uploaded lecture slides and textbook materials.
            Gemini AI will extract high-yield questions, formulas, and definitions.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setCreateDeckModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Empty Deck</span>
            </button>
            <button
              onClick={() => setGeneratorModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate AI Deck</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {decks.map((deck) => (
            <div
              key={deck._id}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-slate-300 hover:shadow-sm transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                    {deck.subjectId?.subjectName || 'Course Deck'}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-extrabold text-blue-600 bg-blue-50/80 px-2.5 py-0.5 rounded-lg">
                      {deck.cardCount || 0} cards
                    </span>
                  </div>
                </div>

                <div>
                  <h3
                    onClick={() => handleSelectDeck(deck._id)}
                    className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 cursor-pointer transition-colors line-clamp-1"
                  >
                    {deck.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>{deck.chapter || 'All Chapters'}</span>
                  </div>
                  {deck.description && (
                    <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                      {deck.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  <span>{new Date(deck.updatedAt).toLocaleDateString()}</span>
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleSelectDeck(deck._id)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    <span>Study</span>
                  </button>
                  <button
                    onClick={() => handleDeleteDeck(deck._id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete deck"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* AI Generator Modal */}
      <FlashcardGeneratorModal
        isOpen={generatorModalOpen}
        onClose={() => setGeneratorModalOpen(false)}
        preselectedSubjectId={selectedSubjectId}
        onGenerated={(deck) => {
          fetchDecks();
          if (deck?._id) handleSelectDeck(deck._id);
        }}
      />

      {/* Create Deck Modal */}
      {createDeckModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-extrabold text-slate-900 text-base">Create Flashcard Deck</h3>
              <button
                onClick={() => setCreateDeckModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeckSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Subject</label>
                <select
                  value={selectedSubjectId || (subjects[0]?._id || '')}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-slate-800"
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Deck Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thermodynamics Chapter 1"
                  value={newDeckTitle}
                  onChange={(e) => setNewDeckTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Chapter (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Energy & Heat"
                  value={newDeckChapter}
                  onChange={(e) => setNewDeckChapter(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-600">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of cards in this deck"
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateDeckModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingDeck || !newDeckTitle.trim()}
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold text-xs disabled:opacity-50"
                >
                  {isCreatingDeck ? 'Creating...' : 'Create Deck'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardsPage;
