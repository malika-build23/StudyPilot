import { useState, useEffect, useCallback } from 'react';
import MathRenderer from '../common/MathRenderer';
import {
  RotateCw,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  BookOpen,
  HelpCircle,
  Tag,
  CheckCircle2
} from 'lucide-react';

const FlashcardViewer = ({ flashcards = [], title = 'Flashcard Revision', onFinish = null }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentCard = flashcards[currentIndex];
  const total = flashcards.length;

  const handleNext = useCallback(() => {
    if (currentIndex < total - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setIsCompleted(true);
      if (onFinish) onFinish();
    }
  }, [currentIndex, total, onFinish]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
      setIsCompleted(false);
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped((prev) => !prev);
  }, []);

  const handleRestart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsCompleted(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      if (e.code === 'Space' || e.key === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrev]);

  if (!flashcards || flashcards.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h4 className="text-base font-bold text-slate-800">No flashcards in this deck</h4>
        <p className="text-xs text-slate-500 mt-1">Add cards manually or use AI to generate questions.</p>
      </div>
    );
  }

  const progressPercent = Math.round(((currentIndex + (isCompleted ? 1 : 0)) / total) * 100);

  if (isCompleted) {
    return (
      <div className="bg-white rounded-3xl p-10 border border-slate-200/80 text-center max-w-xl mx-auto shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-9 h-9" />
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
          Session Complete
        </span>
        <h3 className="text-2xl font-extrabold text-slate-900 mt-2">All {total} Cards Reviewed!</h3>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md mx-auto">
          Great job! You have gone through all flashcards in this deck. You can restart or head over to the Spaced Repetition dashboard.
        </p>

        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={handleRestart}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-xs"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Restart Deck</span>
          </button>
        </div>
      </div>
    );
  }

  const difficultyColors = {
    EASY: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
    HARD: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 select-none">
      {/* Top Header & Progress Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 truncate max-w-[220px]">{title}</span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                difficultyColors[currentCard.difficulty] || difficultyColors.MEDIUM
              }`}
            >
              {currentCard.difficulty || 'MEDIUM'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-slate-500 text-xs">
              Card <span className="text-blue-600 font-bold">{currentIndex + 1}</span> of {total}
            </span>
            <button
              onClick={handleRestart}
              title="Restart from beginning"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress line */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-blue-600 h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        className="w-full min-h-[340px] cursor-pointer perspective"
        onClick={handleFlip}
        style={{ perspective: '1000px' }}
      >
        <div
          className={`relative w-full min-h-[340px] rounded-3xl transition-transform duration-500 transform-style-preserve-3d shadow-sm hover:shadow-md border border-slate-200/90 ${
            isFlipped ? 'rotate-y-180 bg-indigo-50/40' : 'bg-white'
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* FRONT FACE (Question) */}
          <div
            className="absolute inset-0 p-8 flex flex-col justify-between backface-hidden rounded-3xl"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-100">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Question</span>
                </span>

                {currentCard.topic && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-400">
                    <Tag className="w-3 h-3" />
                    <span>{currentCard.topic}</span>
                  </span>
                )}
              </div>

              <div className="py-4 text-lg sm:text-xl font-bold text-slate-900 leading-relaxed">
                <MathRenderer content={currentCard.question} />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{currentCard.chapter || 'Chapter Concept'}</span>
              </span>
              <span className="inline-flex items-center gap-1 text-blue-600 font-semibold bg-blue-50 px-2.5 py-1 rounded-lg">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Click or Space to flip</span>
              </span>
            </div>
          </div>

          {/* BACK FACE (Answer) */}
          <div
            className="absolute inset-0 p-8 flex flex-col justify-between backface-hidden rounded-3xl rotate-y-180 bg-gradient-to-br from-indigo-50/60 to-blue-50/30"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Answer</span>
                </span>

                {currentCard.sourceReference && (
                  <span className="text-[11px] font-medium text-slate-400 bg-white/80 px-2 py-0.5 rounded border border-slate-100">
                    Ref: {currentCard.sourceReference}
                  </span>
                )}
              </div>

              <div className="py-2 text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
                <MathRenderer content={currentCard.answer} />
              </div>

              {currentCard.explanation && (
                <div className="mt-4 p-3.5 rounded-2xl bg-white/90 border border-indigo-100/80 text-xs text-slate-600 leading-relaxed">
                  <span className="font-bold text-indigo-900 block mb-1">Key Context / Explanation:</span>
                  <MathRenderer content={currentCard.explanation} />
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-slate-200/50 flex items-center justify-between text-xs text-slate-400">
              <span>{currentCard.topic || 'Core Concept'}</span>
              <span className="text-indigo-600 font-semibold flex items-center gap-1">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Click to flip back</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Controls & Keyboard Hints */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <button
          onClick={handlePrev}
          disabled={currentIndex === 0}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Card</span>
        </button>

        <button
          onClick={handleFlip}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 font-bold text-xs transition-colors"
        >
          <RotateCw className="w-4 h-4" />
          <span>{isFlipped ? 'Show Question' : 'Reveal Answer'}</span>
        </button>

        <button
          onClick={handleNext}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-all shadow-xs"
        >
          <span>{currentIndex === total - 1 ? 'Finish Deck' : 'Next Card'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-center text-[11px] text-slate-400 pt-1">
        Keyboard Shortcuts: <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px]">Space</kbd> Flip card &bull;{' '}
        <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px]">&larr;</kbd> Previous &bull;{' '}
        <kbd className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[10px]">&rarr;</kbd> Next
      </div>
    </div>
  );
};

export default FlashcardViewer;
