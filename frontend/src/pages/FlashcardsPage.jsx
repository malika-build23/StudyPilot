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
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#20212B] tracking-tight">
              AI Flashcards
            </h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5]">
              Active Recall
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#77756F] mt-1 font-medium">
            Generate active-recall flashcard decks from your course materials using Gemini AI
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setCreateDeckModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-[#FAF8F5] text-[#20212B] font-semibold text-xs transition-all shadow-xs hover:border-[#2D4354]/40 cursor-pointer"
          >
            <FolderPlus className="w-4 h-4 text-[#2D4354]" />
            <span>Create Deck</span>
          </button>

          <button
            onClick={() => setGeneratorModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D4354] hover:bg-[#20212B] text-white font-semibold text-xs shadow-sm transition-all hover:scale-102 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-[#FED7A5]" />
            <span>Generate with AI</span>
          </button>
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedSubjectId('')}
          className={`px-4 py-2 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
            selectedSubjectId === ''
              ? 'bg-[#2D4354] text-white shadow-xs'
              : 'bg-white text-[#77756F] border border-[#F1F0ED] hover:bg-[#FAF8F5] hover:text-[#20212B]'
          }`}
        >
          All Subjects ({decks.length})
        </button>

        {subjects.map((sub) => (
          <button
            key={sub._id}
            onClick={() => setSelectedSubjectId(sub._id)}
            className={`px-4 py-2 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
              selectedSubjectId === sub._id
                ? 'bg-[#2D4354] text-white shadow-xs'
                : 'bg-white text-[#77756F] border border-[#F1F0ED] hover:bg-[#FAF8F5] hover:text-[#20212B]'
            }`}
          >
            {sub.subjectName}
          </button>
        ))}
      </div>

      {/* Decks Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#2D4354]" />
          <p className="text-xs text-[#77756F] font-semibold">Loading flashcard decks...</p>
        </div>
      ) : decks.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-[#F1F0ED] text-center shadow-[0_4px_24px_-2px_rgba(45,67,84,0.04)] relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF7EC] text-[#9E6752] flex items-center justify-center mx-auto mb-4 border border-[#FED7A5]/60 shadow-2xs">
            <Layers className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#20212B]">No Flashcard Decks Found</h3>
          <p className="text-xs text-[#77756F] mt-1.5 max-w-md mx-auto leading-relaxed font-medium">
            Create interactive flashcards from your uploaded lecture slides and textbook materials.
            Gemini AI will extract high-yield questions, formulas, and definitions.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => setCreateDeckModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-[#20212B] font-semibold text-xs hover:bg-[#FAF8F5] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Empty Deck</span>
            </button>
            <button
              onClick={() => setGeneratorModalOpen(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D4354] hover:bg-[#20212B] text-white font-semibold text-xs shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#FED7A5]" />
              <span>Generate AI Deck</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {decks.map((deck, idx) => {
            const accents = [
              { border: 'border-l-[#2D4354]', badge: 'bg-[#FAF8F5] text-[#2D4354] border-[#2D4354]/20', count: 'text-[#2D4354] bg-[#FAF8F5]' },
              { border: 'border-l-[#9E6752]', badge: 'bg-[#FFF7EC] text-[#9E6752] border-[#FED7A5]', count: 'text-[#9E6752] bg-[#FFF7EC]' },
              { border: 'border-l-[#73766A]', badge: 'bg-[#F1F0ED] text-[#73766A] border-slate-300', count: 'text-[#73766A] bg-[#F1F0ED]' },
              { border: 'border-l-[#534145]', badge: 'bg-[#FAF8F5] text-[#534145] border-[#534145]/20', count: 'text-[#534145] bg-[#FAF8F5]' },
            ];
            const acc = accents[idx % accents.length];

            return (
              <div
                key={deck._id}
                className={`bg-white rounded-3xl p-6 border border-[#F1F0ED] ${acc.border} border-l-4 shadow-[0_4px_20px_-2px_rgba(45,67,84,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(45,67,84,0.1)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${acc.badge}`}>
                      {deck.subjectId?.subjectName || 'Course Deck'}
                    </span>
                    <div className="flex items-center gap-1">
                      <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-lg border border-slate-100 ${acc.count}`}>
                        {deck.cardCount || 0} cards
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3
                      onClick={() => handleSelectDeck(deck._id)}
                      className="font-extrabold text-[#20212B] text-base group-hover:text-[#2D4354] cursor-pointer transition-colors line-clamp-1"
                    >
                      {deck.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#77756F] mt-1 font-medium">
                      <BookOpen className="w-3.5 h-3.5 text-[#73766A]" />
                      <span>{deck.chapter || 'All Chapters'}</span>
                    </div>
                    {deck.description && (
                      <p className="text-xs text-[#77756F] mt-2 line-clamp-2 leading-relaxed font-medium">
                        {deck.description}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-[#F1F0ED] flex items-center justify-between">
                  <span className="text-[11px] text-[#77756F] flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3 text-[#73766A]" />
                    <span>{new Date(deck.updatedAt).toLocaleDateString()}</span>
                  </span>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleSelectDeck(deck._id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2D4354] hover:bg-[#20212B] text-white font-semibold text-xs shadow-xs transition-all hover:scale-102 cursor-pointer"
                    >
                      <Play className="w-3 h-3 text-[#FED7A5]" />
                      <span>Study</span>
                    </button>
                    <button
                      onClick={() => handleDeleteDeck(deck._id)}
                      className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                      title="Delete deck"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
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
          <div className="bg-white rounded-3xl w-full max-w-md border border-slate-100 shadow-xl overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#F5F7FC] to-white">
              <h3 className="font-extrabold text-[#202B42] text-base">Create Flashcard Deck</h3>
              <button
                onClick={() => setCreateDeckModalOpen(false)}
                className="p-1.5 rounded-xl text-[#77839A] hover:text-[#202B42] hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDeckSubmit} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#202B42]">Subject</label>
                <select
                  value={selectedSubjectId || (subjects[0]?._id || '')}
                  onChange={(e) => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs font-medium text-[#202B42] bg-white outline-none focus:border-[#4169E1] focus:ring-2 focus:ring-[#4169E1]/15"
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.subjectName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#202B42]">Deck Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thermodynamics Chapter 1"
                  value={newDeckTitle}
                  onChange={(e) => setNewDeckTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-[#202B42] outline-none focus:border-[#4169E1] focus:ring-2 focus:ring-[#4169E1]/15"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#77839A]">Chapter (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Energy & Heat"
                  value={newDeckChapter}
                  onChange={(e) => setNewDeckChapter(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#202B42] outline-none focus:border-[#4169E1]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#77839A]">Description (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Brief summary of cards in this deck"
                  value={newDeckDesc}
                  onChange={(e) => setNewDeckDesc(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-[#202B42] outline-none focus:border-[#4169E1]"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setCreateDeckModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-[#77839A] hover:bg-[#F5F7FC] transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCreatingDeck || !newDeckTitle.trim()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#4169E1] to-[#3557C7] text-white font-semibold text-xs disabled:opacity-50 shadow-xs hover:opacity-95 transition-all"
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
