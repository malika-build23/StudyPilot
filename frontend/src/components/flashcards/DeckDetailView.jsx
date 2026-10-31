import { useState } from 'react';
import FlashcardViewer from './FlashcardViewer';
import FlashcardEditorModal from './FlashcardEditorModal';
import MathRenderer from '../common/MathRenderer';
import {
  ArrowLeft,
  Sparkles,
  Plus,
  Play,
  List,
  Edit2,
  Trash2,
  HelpCircle,
  Tag,
  BookOpen
} from 'lucide-react';

const DeckDetailView = ({
  deck,
  flashcards = [],
  onBack,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onDeleteDeck,
  onOpenGenerator,
  onStartRevision,
}) => {
  const [activeTab, setActiveTab] = useState('study'); // 'study' | 'cards'
  const [editingCard, setEditingCard] = useState(null);
  const [editorModalOpen, setEditorModalOpen] = useState(false);

  const handleEditCard = (card) => {
    setEditingCard(card);
    setEditorModalOpen(true);
  };

  const handleCreateCard = () => {
    setEditingCard(null);
    setEditorModalOpen(true);
  };

  const handleSaveCard = async (formData) => {
    if (editingCard) {
      await onUpdateCard(editingCard._id, formData);
    } else {
      await onAddCard(formData);
    }
  };

  const difficultyBadges = {
    EASY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
    HARD: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Navigation & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#77839A] hover:text-[#4169E1] transition-colors self-start"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Decks</span>
        </button>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Tab switch */}
          <div className="bg-white p-1 rounded-2xl border border-slate-200/80 flex items-center gap-1 text-xs font-semibold shadow-xs">
            <button
              onClick={() => setActiveTab('study')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === 'study'
                  ? 'bg-gradient-to-r from-[#4169E1] to-[#3557C7] text-white shadow-xs'
                  : 'text-[#77839A] hover:text-[#202B42]'
              }`}
            >
              <Play className="w-3.5 h-3.5" />
              <span>Study Mode</span>
            </button>
            <button
              onClick={() => setActiveTab('cards')}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                activeTab === 'cards'
                  ? 'bg-gradient-to-r from-[#4169E1] to-[#3557C7] text-white shadow-xs'
                  : 'text-[#77839A] hover:text-[#202B42]'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Cards ({flashcards.length})</span>
            </button>
          </div>

          <button
            onClick={handleCreateCard}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-[#F5F7FC] text-xs font-semibold text-[#202B42] transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 text-[#4169E1]" />
            <span>Add Card</span>
          </button>

          <button
            onClick={onOpenGenerator}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#4169E1] to-[#9270DB] hover:opacity-95 text-white text-xs font-semibold shadow-xs transition-all hover:scale-102"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Generate More</span>
          </button>

          {onStartRevision && (
            <button
              onClick={() => onStartRevision(deck._id)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#9270DB] to-[#7B58C9] hover:opacity-95 text-white text-xs font-semibold shadow-xs transition-all hover:scale-102"
            >
              <Play className="w-3.5 h-3.5" />
              <span>Revise with SRS</span>
            </button>
          )}

          <button
            onClick={() => onDeleteDeck(deck._id)}
            title="Delete Deck"
            className="p-2 rounded-xl text-[#77839A] hover:text-red-600 hover:bg-red-50 border border-slate-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Deck Overview Banner */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#4169E1]/5 via-[#9270DB]/5 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#4169E1]/10 text-[#4169E1] border border-[#4169E1]/20">
              {deck.subjectId?.subjectName || 'Course Deck'}
            </span>
            <span className="text-xs text-[#77839A] flex items-center gap-1 font-medium">
              <BookOpen className="w-3.5 h-3.5 text-[#9270DB]" />
              {deck.chapter || 'All Chapters'}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-[#202B42] tracking-tight">
            {deck.title}
          </h2>
          {deck.description && (
            <p className="text-xs text-[#77839A] mt-1 max-w-xl leading-relaxed">{deck.description}</p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0 relative z-10">
          <div className="text-right bg-[#F5F7FC] px-4 py-2.5 rounded-2xl border border-slate-100">
            <div className="text-2xl font-extrabold text-[#4169E1]">{flashcards.length}</div>
            <div className="text-[10px] font-bold text-[#77839A] uppercase tracking-wider">
              Total Cards
            </div>
          </div>
        </div>
      </div>

      {/* Mode Switch Content */}
      {activeTab === 'study' ? (
        <div className="pt-2">
          <FlashcardViewer flashcards={flashcards} title={deck.title} />
        </div>
      ) : (
        /* Card Management List */
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 px-1">
            <span>List of cards in this deck ({flashcards.length})</span>
            <span>Click card to edit question or answer</span>
          </div>

          {flashcards.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-slate-200">
              <HelpCircle className="w-10 h-10 text-slate-300 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No cards in this deck yet</p>
              <button
                onClick={handleCreateCard}
                className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add First Flashcard</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {flashcards.map((card, idx) => (
                <div
                  key={card._id}
                  className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-xs"
                >
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-bold text-slate-400">#{idx + 1}</span>
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                          difficultyBadges[card.difficulty] || difficultyBadges.MEDIUM
                        }`}
                      >
                        {card.difficulty}
                      </span>
                      {card.topic && (
                        <span className="text-[11px] font-medium text-slate-500 flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded">
                          <Tag className="w-3 h-3 text-slate-400" />
                          <span>{card.topic}</span>
                        </span>
                      )}
                    </div>

                    <div>
                      <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Question
                      </div>
                      <div className="text-sm font-semibold text-slate-900 mt-0.5">
                        <MathRenderer content={card.question} />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-600">
                        Answer
                      </div>
                      <div className="text-xs text-slate-700 mt-0.5 leading-relaxed">
                        <MathRenderer content={card.answer} />
                      </div>
                    </div>

                    {card.explanation && (
                      <div className="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-xl">
                        <span className="font-semibold text-slate-700">Explanation: </span>
                        <MathRenderer content={card.explanation} />
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-start">
                    <button
                      onClick={() => handleEditCard(card)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit card"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteCard(card._id)}
                      className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete card"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Editor Modal */}
      <FlashcardEditorModal
        isOpen={editorModalOpen}
        onClose={() => setEditorModalOpen(false)}
        onSave={handleSaveCard}
        deckId={deck._id}
        initialData={editingCard}
      />
    </div>
  );
};

export default DeckDetailView;
