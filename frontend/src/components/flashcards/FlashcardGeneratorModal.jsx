import { useState, useEffect } from 'react';
import { subjectsAPI, materialsAPI, flashcardsAPI } from '../../services/api';
import {
  X,
  Sparkles,
  BookOpen,
  FileText,
  Layers,
  BarChart,
  Loader2,
  AlertCircle
} from 'lucide-react';

const FlashcardGeneratorModal = ({
  isOpen,
  onClose,
  onGenerated,
  preselectedSubjectId = '',
  preselectedMaterialId = '',
}) => {
  const [subjects, setSubjects] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [loadingMaterials, setLoadingMaterials] = useState(false);

  // Form State
  const [subjectId, setSubjectId] = useState(preselectedSubjectId || '');
  const [materialId, setMaterialId] = useState(preselectedMaterialId || '');
  const [chapter, setChapter] = useState('');
  const [topic, setTopic] = useState('');
  const [cardCount, setCardCount] = useState(10);
  const [difficulty, setDifficulty] = useState('MEDIUM');
  const [deckTitle, setDeckTitle] = useState('');

  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');

  // Fetch subjects
  useEffect(() => {
    if (!isOpen) return;

    const fetchSubjects = async () => {
      try {
        setLoadingSubjects(true);
        const res = await subjectsAPI.getAll();
        if (res.data?.success) {
          const list = res.data.data || [];
          setSubjects(list);
          if (!subjectId && list.length > 0) {
            setSubjectId(list[0]._id);
          }
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      } finally {
        setLoadingSubjects(false);
      }
    };

    fetchSubjects();
  }, [isOpen]);

  // Fetch materials whenever subject changes
  useEffect(() => {
    if (!subjectId || !isOpen) {
      setMaterials([]);
      return;
    }

    const fetchMaterials = async () => {
      try {
        setLoadingMaterials(true);
        const res = await materialsAPI.getBySubject(subjectId);
        if (res.data?.success) {
          const mats = (res.data.data || res.data.materials || []).filter(
            (m) => m.processingStatus === 'completed'
          );
          setMaterials(mats);
          if (mats.length > 0) {
            // Keep preselected if matching, otherwise auto-select first
            if (!materialId || !mats.some((m) => m._id === materialId)) {
              setMaterialId(mats[0]._id);
            }
          } else {
            setMaterialId('');
          }
        }
      } catch (err) {
        console.error('Failed to load materials for subject:', err);
      } finally {
        setLoadingMaterials(false);
      }
    };

    fetchMaterials();
  }, [subjectId, isOpen]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!subjectId) {
      setError('Please select a subject.');
      return;
    }

    if (!materialId) {
      setError('Please select an uploaded study document to generate flashcards from.');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');

      const res = await flashcardsAPI.generate({
        subjectId,
        materialId,
        deckTitle: deckTitle.trim(),
        chapter: chapter.trim(),
        topic: topic.trim(),
        cardCount: parseInt(cardCount, 10),
        difficulty,
      });

      if (res.data?.success) {
        if (onGenerated) {
          onGenerated(res.data.deck, res.data.flashcards);
        }
        onClose();
      }
    } catch (err) {
      console.error('Flashcard generation failed:', err);
      setError(
        err.response?.data?.message ||
          'Failed to generate flashcards. Please verify document content and try again.'
      );
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-lg border border-slate-200 shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 to-indigo-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs shadow-blue-500/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-900 text-base">Generate AI Flashcards</h3>
              <p className="text-xs text-slate-500">
                Create interactive revision cards powered by Gemini
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleGenerate} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* 1. Subject Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>1. Select Subject</span>
            </label>
            <select
              value={subjectId}
              onChange={(e) => setSubjectId(e.target.value)}
              disabled={isGenerating || loadingSubjects}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            >
              {subjects.map((sub) => (
                <option key={sub._id} value={sub._id}>
                  {sub.subjectName} ({sub.semester || 'Workspace'})
                </option>
              ))}
            </select>
          </div>

          {/* 2. Uploaded Document Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              <span>2. Select Uploaded Document (PDF / PPTX)</span>
            </label>

            {loadingMaterials ? (
              <div className="flex items-center gap-2 py-2 text-xs text-slate-400">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Loading course documents...</span>
              </div>
            ) : materials.length === 0 ? (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                No processed study materials found for this subject. Please upload a PDF or PPTX in
                the subject workspace first.
              </div>
            ) : (
              <select
                value={materialId}
                onChange={(e) => setMaterialId(e.target.value)}
                disabled={isGenerating}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                {materials.map((mat) => (
                  <option key={mat._id} value={mat._id}>
                    {mat.fileName} ({mat.fileType?.toUpperCase()})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* 3. Chapter / Topic Filter */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Chapter (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Chapter 3: Energy"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                disabled={isGenerating}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                <span>Topic (Optional)</span>
              </label>
              <input
                type="text"
                placeholder="e.g. First Law, Work Done"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={isGenerating}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              />
            </div>
          </div>

          {/* 4. Card Count & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BarChart className="w-3.5 h-3.5 text-blue-600" />
                <span>Number of Flashcards</span>
              </label>
              <select
                value={cardCount}
                onChange={(e) => setCardCount(Number(e.target.value))}
                disabled={isGenerating}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                <option value={5}>5 Flashcards (Quick)</option>
                <option value={10}>10 Flashcards (Standard)</option>
                <option value={15}>15 Flashcards (Deep Dive)</option>
                <option value={20}>20 Flashcards (Comprehensive)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <BarChart className="w-3.5 h-3.5 text-blue-600" />
                <span>Difficulty</span>
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                disabled={isGenerating}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
              >
                <option value="EASY">Easy (Foundational Definitions)</option>
                <option value="MEDIUM">Medium (Conceptual & Formulas)</option>
                <option value="HARD">Hard (Advanced & Applications)</option>
              </select>
            </div>
          </div>

          {/* Deck Custom Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-600">
              Deck Title (Optional)
            </label>
            <input
              type="text"
              placeholder="Leave blank for automatic smart title"
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
              disabled={isGenerating}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isGenerating}
              className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isGenerating || !materialId}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold text-xs transition-all shadow-xs shadow-blue-500/25"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Gemini is generating cards...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Flashcards</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FlashcardGeneratorModal;
