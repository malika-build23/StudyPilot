import { useState } from 'react';
import MathRenderer from '../common/MathRenderer';
import { revisionAPI } from '../../services/api';
import {
  RotateCcw,
  Sparkles,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Tag,
  Loader2,
  PartyPopper
} from 'lucide-react';

const DailyRevisionSession = ({
  dueItems = [],
  onFinishSession,
  onExitSession,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAnswerRevealed, setIsAnswerRevealed] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sessionResults, setSessionResults] = useState({
    again: 0,
    hard: 0,
    easy: 0,
  });
  const [sessionCompleted, setSessionCompleted] = useState(false);

  const currentItem = dueItems[currentIndex];
  const total = dueItems.length;

  const handleReveal = () => {
    setIsAnswerRevealed(true);
  };

  const handleReviewResponse = async (rating) => {
    if (!currentItem || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const flashcardId = currentItem.flashcard._id;

      await revisionAPI.submitReview(flashcardId, rating);

      // Track session tally
      setSessionResults((prev) => ({
        ...prev,
        [rating]: prev[rating] + 1,
      }));

      // Next card or finish
      if (currentIndex + 1 < total) {
        setCurrentIndex((prev) => prev + 1);
        setIsAnswerRevealed(false);
      } else {
        setSessionCompleted(true);
        if (onFinishSession) onFinishSession();
      }
    } catch (err) {
      console.error('Failed to submit revision review:', err);
      alert('Failed to record review response. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!dueItems || dueItems.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 max-w-lg mx-auto shadow-xs">
        <CheckCircle2 className="w-14 h-14 text-emerald-500 mx-auto mb-3" />
        <h3 className="text-xl font-extrabold text-slate-900">No Cards Due for Review!</h3>
        <p className="text-xs text-slate-500 mt-2 max-w-md mx-auto">
          You are all caught up on your spaced repetition schedule. Check back tomorrow or review your decks in study mode.
        </p>
        <button
          onClick={onExitSession}
          className="mt-6 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold text-xs shadow-xs"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  if (sessionCompleted) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 text-center max-w-lg mx-auto shadow-sm space-y-5 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <PartyPopper className="w-9 h-9" />
        </div>

        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
            Revision Session Done
          </span>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-2">
            Fantastic Effort! 🎉
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            You successfully completed your revision session of {total} flashcards.
          </p>
        </div>

        {/* Breakdown pills */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100">
          <div className="text-center">
            <span className="text-xl font-extrabold text-emerald-600">{sessionResults.easy}</span>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Easy (Correct)</p>
          </div>
          <div className="text-center border-x border-slate-200/80">
            <span className="text-xl font-extrabold text-blue-600">{sessionResults.hard}</span>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Hard</p>
          </div>
          <div className="text-center">
            <span className="text-xl font-extrabold text-amber-600">{sessionResults.again}</span>
            <p className="text-[10px] font-bold text-slate-400 uppercase mt-0.5">Again</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onExitSession}
            className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all"
          >
            Back to Revision Overview
          </button>
        </div>
      </div>
    );
  }

  const card = currentItem.flashcard;
  const progressPercent = Math.round(((currentIndex + 1) / total) * 100);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Session Header */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-slate-800">Spaced Revision</span>
            {currentItem.isOverdue && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200">
                Overdue
              </span>
            )}
            {currentItem.isDifficult && (
              <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                Weak Concept
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-500">
              Card <span className="font-bold text-blue-600">{currentIndex + 1}</span> of {total}
            </span>
            <button
              onClick={onExitSession}
              className="text-xs font-semibold text-slate-400 hover:text-slate-700"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          <div
            className="bg-indigo-600 h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Flashcard Card */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
        {/* Card Metadata */}
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700">{card.subjectId?.subjectName || 'Course'}</span>
            <span>&bull;</span>
            <span>{card.chapter || 'Chapter Concept'}</span>
          </div>
          {card.topic && (
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded">
              <Tag className="w-3 h-3 text-slate-400" />
              <span>{card.topic}</span>
            </span>
          )}
        </div>

        {/* Question Area */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-blue-600">
            <HelpCircle className="w-4 h-4" />
            <span>Question</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-slate-900 leading-relaxed pt-1">
            <MathRenderer content={card.question} />
          </div>
        </div>

        {/* Answer Area (Revealed or Hidden) */}
        {!isAnswerRevealed ? (
          <div className="pt-6 border-t border-slate-100 flex flex-col items-center justify-center py-8">
            <button
              onClick={handleReveal}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-xs shadow-indigo-500/25 transition-all hover:scale-102"
            >
              <Sparkles className="w-4 h-4" />
              <span>Reveal Answer</span>
            </button>
            <p className="text-[11px] text-slate-400 mt-2">
              Try to recall the answer before revealing
            </p>
          </div>
        ) : (
          <div className="pt-6 border-t border-slate-100 space-y-4 animate-in fade-in duration-150">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-emerald-600">
                <CheckCircle2 className="w-4 h-4" />
                <span>Answer</span>
              </div>
              <div className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed bg-emerald-50/40 p-4 rounded-2xl border border-emerald-100">
                <MathRenderer content={card.answer} />
              </div>
            </div>

            {card.explanation && (
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-600 leading-relaxed">
                <span className="font-bold text-slate-800 block mb-1">Concept Explanation:</span>
                <MathRenderer content={card.explanation} />
              </div>
            )}

            {/* SRS Recall Feedback Responses */}
            <div className="pt-4 border-t border-slate-100 space-y-3">
              <div className="text-center">
                <p className="text-xs font-bold text-slate-700">How well did you remember this?</p>
                <p className="text-[11px] text-slate-400">
                  Select a response to schedule the next review interval
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. AGAIN */}
                <button
                  onClick={() => handleReviewResponse('again')}
                  disabled={isSubmitting}
                  className="p-3.5 rounded-2xl border border-amber-200 bg-amber-50/60 hover:bg-amber-100/80 text-amber-900 flex flex-col items-center justify-center transition-all hover:scale-102 disabled:opacity-50"
                >
                  <span className="text-xs font-extrabold">Again</span>
                  <span className="text-[11px] text-amber-700 font-medium mt-0.5">Could not recall</span>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full mt-1.5">
                    10 minutes
                  </span>
                </button>

                {/* 2. HARD */}
                <button
                  onClick={() => handleReviewResponse('hard')}
                  disabled={isSubmitting}
                  className="p-3.5 rounded-2xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/80 text-blue-900 flex flex-col items-center justify-center transition-all hover:scale-102 disabled:opacity-50"
                >
                  <span className="text-xs font-extrabold">Hard</span>
                  <span className="text-[11px] text-blue-700 font-medium mt-0.5">Recalled with effort</span>
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-200/60 px-2 py-0.5 rounded-full mt-1.5">
                    1 day
                  </span>
                </button>

                {/* 3. EASY */}
                <button
                  onClick={() => handleReviewResponse('easy')}
                  disabled={isSubmitting}
                  className="p-3.5 rounded-2xl border border-emerald-200 bg-emerald-50/60 hover:bg-emerald-100/80 text-emerald-900 flex flex-col items-center justify-center transition-all hover:scale-102 disabled:opacity-50"
                >
                  <span className="text-xs font-extrabold">Easy</span>
                  <span className="text-[11px] text-emerald-700 font-medium mt-0.5">Recalled correctly</span>
                  <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-full mt-1.5">
                    3+ days
                  </span>
                </button>
              </div>

              {isSubmitting && (
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400 pt-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                  <span>Calculating next interval...</span>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DailyRevisionSession;
