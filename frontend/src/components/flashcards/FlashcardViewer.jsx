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
    EASY: 'bg-[#55BFA5]/15 text-[#55BFA5] border-[#55BFA5]/30',
    MEDIUM: 'bg-[#4169E1]/15 text-[#4169E1] border-[#4169E1]/30',
    HARD: 'bg-[#FF927E]/20 text-[#FF927E] border-[#FF927E]/30',
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5 select-none">
      {/* Top Header & Progress Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <span className="font-bold text-[#202B42] truncate max-w-[220px] text-sm">{title}</span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                difficultyColors[currentCard.difficulty] || 'bg-[#FFF7EC] text-[#9E6752] border-[#FED7A5]'
              }`}
            >
              {currentCard.difficulty || 'MEDIUM'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-[#77756F] text-xs">
              Card <span className="text-[#2D4354] font-extrabold">{currentIndex + 1}</span> of {total}
            </span>
            <button
              onClick={handleRestart}
              title="Restart from beginning"
              className="p-1.5 rounded-xl text-[#77756F] hover:text-[#20212B] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress line */}
        <div className="w-full bg-[#F1F0ED] h-2.5 rounded-full overflow-hidden p-0.5 border border-[#F1F0ED]">
          <div
            className="bg-gradient-to-r from-[#2D4354] via-[#9E6752] to-[#FED7A5] h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 3D Flip Card Container */}
      <div
        className="w-full min-h-[360px] cursor-pointer"
        onClick={handleFlip}
        style={{ perspective: '1000px' }}
      >
        <div
          className={`relative w-full min-h-[360px] rounded-3xl transition-transform duration-500 shadow-[0_8px_30px_rgb(45,67,84,0.08)] hover:shadow-[0_16px_36px_rgb(45,67,84,0.14)] border border-[#F1F0ED] ${
            isFlipped ? 'bg-gradient-to-br from-white via-[#FFF7EC]/40 to-[#FED7A5]/10' : 'bg-white'
          }`}
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          {/* FRONT FACE (Question) */}
          <div
            className="absolute inset-0 p-8 sm:p-10 flex flex-col justify-between rounded-3xl"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#2D4354] bg-[#FAF8F5] px-3 py-1 rounded-full border border-[#2D4354]/20">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Question</span>
                </span>

                {currentCard.topic && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[#77756F] bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-slate-200">
                    <Tag className="w-3 h-3 text-[#73766A]" />
                    <span>{currentCard.topic}</span>
                  </span>
                )}
              </div>

              <div className="py-4 text-xl sm:text-2xl font-extrabold text-[#20212B] leading-relaxed">
                <MathRenderer content={currentCard.question} />
              </div>
            </div>

            <div className="pt-4 border-t border-[#F1F0ED] flex items-center justify-between text-xs text-[#77756F]">
              <span className="flex items-center gap-1.5 font-medium">
                <BookOpen className="w-3.5 h-3.5 text-[#2D4354]" />
                <span>{currentCard.chapter || 'Chapter Concept'}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 text-[#2D4354] font-semibold bg-[#FAF8F5] px-3 py-1 rounded-xl border border-slate-200">
                <RotateCw className="w-3.5 h-3.5" />
                <span>Click or Space to flip</span>
              </span>
            </div>
          </div>

          {/* BACK FACE (Answer) */}
          <div
            className="absolute inset-0 p-8 sm:p-10 flex flex-col justify-between rounded-3xl bg-gradient-to-br from-white via-[#FFF7EC] to-[#FED7A5]/20"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9E6752] bg-[#FFF7EC] px-3 py-1 rounded-full border border-[#FED7A5]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Answer</span>
                </span>

                {currentCard.sourceReference && (
                  <span className="text-[11px] font-medium text-[#77756F] bg-white px-2.5 py-0.5 rounded-full border border-slate-200">
                    Ref: {currentCard.sourceReference}
                  </span>
                )}
              </div>

              <div className="py-2 text-lg sm:text-xl font-bold text-[#20212B] leading-relaxed">
                <MathRenderer content={currentCard.answer} />
              </div>

              {currentCard.explanation && (
                <div className="mt-4 p-4 rounded-2xl bg-white/95 border border-[#FED7A5] text-xs text-[#77756F] leading-relaxed shadow-xs">
                  <span className="font-bold text-[#9E6752] block mb-1">Key Context / Explanation:</span>
                  <MathRenderer content={currentCard.explanation} />
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#FED7A5]/60 flex items-center justify-between text-xs text-[#77756F]">
              <span>{currentCard.topic || 'Core Concept'}</span>
              <span className="text-[#9E6752] font-semibold flex items-center gap-1.5">
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
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-[#FAF8F5] text-[#20212B] font-semibold text-xs disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-xs cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous Card</span>
        </button>

        <button
          onClick={handleFlip}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5] hover:bg-[#FED7A5]/40 font-bold text-xs transition-colors cursor-pointer"
        >
          <RotateCw className="w-4 h-4" />
          <span>{isFlipped ? 'Show Question' : 'Reveal Answer'}</span>
        </button>

        <button
          onClick={handleNext}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#2D4354] hover:bg-[#20212B] text-white font-semibold text-xs transition-all shadow-sm hover:scale-102 cursor-pointer"
        >
          <span>{currentIndex === total - 1 ? 'Finish Deck' : 'Next Card'}</span>
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="text-center text-[11px] text-[#77756F] pt-1">
        Keyboard Shortcuts: <kbd className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[10px] text-[#20212B]">Space</kbd> Flip card &bull;{' '}
        <kbd className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[10px] text-[#20212B]">&larr;</kbd> Previous &bull;{' '}
        <kbd className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-mono text-[10px] text-[#202B42]">&rarr;</kbd> Next
      </div>
    </div>
  );
};

export default FlashcardViewer;
