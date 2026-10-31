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
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#F1F0ED] text-center max-w-lg mx-auto shadow-md space-y-5 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-2xl bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5] flex items-center justify-center mx-auto shadow-xs">
          <PartyPopper className="w-9 h-9" />
        </div>

        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5]">
            Revision Session Done
          </span>
          <h3 className="text-2xl font-black text-[#20212B] mt-2 tracking-tight">
            Fantastic Effort! 🎉
          </h3>
          <p className="text-xs text-[#77756F] mt-1 max-w-sm mx-auto font-medium">
            You successfully completed your revision session of {total} flashcards.
          </p>
        </div>

        {/* Breakdown pills */}
        <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-[#FAF8F5] border border-[#F1F0ED]">
          <div className="text-center">
            <span className="text-xl font-extrabold text-[#2D4354]">{sessionResults.easy}</span>
            <p className="text-[10px] font-bold text-[#77756F] uppercase mt-0.5">Easy (Correct)</p>
          </div>
          <div className="text-center border-x border-[#73766A]/20">
            <span className="text-xl font-extrabold text-[#73766A]">{sessionResults.hard}</span>
            <p className="text-[10px] font-bold text-[#77756F] uppercase mt-0.5">Hard</p>
          </div>
          <div className="text-center">
            <span className="text-xl font-extrabold text-[#9E6752]">{sessionResults.again}</span>
            <p className="text-[10px] font-bold text-[#77756F] uppercase mt-0.5">Again</p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            onClick={onExitSession}
            className="px-6 py-3 rounded-xl bg-[#2D4354] hover:bg-[#20212B] text-white font-bold text-xs shadow-md transition-all hover:scale-102 cursor-pointer"
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
      <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3.5">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-extrabold text-[#202B42] text-sm">Spaced Revision</span>
            {currentItem.isOverdue && (
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[#FF927E]/15 text-[#FF927E] border border-[#FF927E]/30">
                Overdue
              </span>
            )}
            {currentItem.isDifficult && (
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                Weak Concept
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#77839A]">
              Card <span className="font-bold text-[#4169E1]">{currentIndex + 1}</span> of {total}
            </span>
            <button
              onClick={onExitSession}
              className="text-xs font-semibold text-[#77839A] hover:text-[#202B42] transition-colors"
            >
              Exit
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-[#F5F7FC] h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-100">
          <div
            className="bg-gradient-to-r from-[#4169E1] via-[#9270DB] to-[#55BFA5] h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Flashcard Card */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 sm:p-9 space-y-6">
        {/* Card Metadata */}
        <div className="flex items-center justify-between text-xs text-[#77839A] border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#202B42]">{card.subjectId?.subjectName || 'Course'}</span>
            <span>&bull;</span>
            <span>{card.chapter || 'Chapter Concept'}</span>
          </div>
          {card.topic && (
            <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-[#77839A] bg-[#F5F7FC] px-2.5 py-0.5 rounded-full border border-slate-100">
              <Tag className="w-3 h-3 text-[#9270DB]" />
              <span>{card.topic}</span>
            </span>
          )}
        </div>

        {/* Question Area */}
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#4169E1]">
            <HelpCircle className="w-4 h-4" />
            <span>Question</span>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-[#202B42] leading-relaxed pt-1">
            <MathRenderer content={card.question} />
          </div>
        </div>

        {/* Answer Area (Revealed or Hidden) */}
        {!isAnswerRevealed ? (
          <div className="pt-6 border-t border-[#F1F0ED] flex flex-col items-center justify-center py-8">
            <button
              onClick={handleReveal}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-[#2D4354] hover:bg-[#20212B] text-white font-bold text-sm shadow-md transition-all hover:scale-102 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#FED7A5]" />
              <span>Reveal Answer</span>
            </button>
            <p className="text-[11px] text-[#77756F] mt-2 font-medium">
              Try to recall the answer before revealing
            </p>
          </div>
        ) : (
          <div className="pt-6 border-t border-[#F1F0ED] space-y-5 animate-in fade-in duration-150">
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[#9E6752]">
                <CheckCircle2 className="w-4 h-4 text-[#9E6752]" />
                <span>Answer</span>
              </div>
              <div className="text-base sm:text-lg font-semibold text-[#20212B] leading-relaxed bg-[#FFF7EC] p-5 rounded-2xl border border-[#FED7A5]">
                <MathRenderer content={card.answer} />
              </div>
            </div>

            {card.explanation && (
              <div className="p-4 rounded-2xl bg-white border border-[#FED7A5] text-xs text-[#77756F] leading-relaxed shadow-xs">
                <span className="font-bold text-[#9E6752] block mb-1">Concept Explanation:</span>
                <MathRenderer content={card.explanation} />
              </div>
            )}

            {/* SRS Recall Feedback Responses */}
            <div className="pt-4 border-t border-[#F1F0ED] space-y-3.5">
              <div className="text-center">
                <p className="text-xs font-bold text-[#20212B]">How well did you remember this?</p>
                <p className="text-[11px] text-[#77756F] mt-0.5 font-medium">
                  Select a response to schedule the next review interval
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* 1. AGAIN */}
                <button
                  onClick={() => handleReviewResponse('again')}
                  disabled={isSubmitting}
                  className="p-4 rounded-2xl border border-[#9E6752]/40 bg-[#FFF7EC] hover:bg-[#FED7A5]/40 text-[#20212B] flex flex-col items-center justify-center transition-all hover:scale-102 hover:shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <span className="text-xs font-extrabold text-[#9E6752]">Again</span>
                  <span className="text-[11px] text-[#77756F] font-medium mt-0.5">Could not recall</span>
                  <span className="text-[10px] font-bold text-[#9E6752] bg-[#FED7A5]/40 px-2.5 py-0.5 rounded-full mt-1.5 border border-[#FED7A5]">
                    10 minutes
                  </span>
                </button>

                {/* 2. HARD */}
                <button
                  onClick={() => handleReviewResponse('hard')}
                  disabled={isSubmitting}
                  className="p-4 rounded-2xl border border-[#73766A]/40 bg-[#F1F0ED] hover:bg-slate-200/80 text-[#20212B] flex flex-col items-center justify-center transition-all hover:scale-102 hover:shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <span className="text-xs font-extrabold text-[#73766A]">Hard</span>
                  <span className="text-[11px] text-[#77756F] font-medium mt-0.5">Recalled with effort</span>
                  <span className="text-[10px] font-bold text-[#73766A] bg-white px-2.5 py-0.5 rounded-full mt-1.5 border border-slate-200">
                    1 day
                  </span>
                </button>

                {/* 3. EASY */}
                <button
                  onClick={() => handleReviewResponse('easy')}
                  disabled={isSubmitting}
                  className="p-4 rounded-2xl border border-[#2D4354]/40 bg-[#FAF8F5] hover:bg-[#2D4354]/10 text-[#20212B] flex flex-col items-center justify-center transition-all hover:scale-102 hover:shadow-xs disabled:opacity-50 cursor-pointer"
                >
                  <span className="text-xs font-extrabold text-[#2D4354]">Easy</span>
                  <span className="text-[11px] text-[#77756F] font-medium mt-0.5">Recalled correctly</span>
                  <span className="text-[10px] font-bold text-[#2D4354] bg-[#2D4354]/10 px-2.5 py-0.5 rounded-full mt-1.5 border border-[#2D4354]/20">
                    3+ days
                  </span>
                </button>
              </div>

              {isSubmitting && (
                <div className="flex items-center justify-center gap-2 text-xs text-[#77756F] pt-1">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2D4354]" />
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
