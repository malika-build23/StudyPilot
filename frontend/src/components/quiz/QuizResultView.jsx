import { useState } from 'react';
import MathRenderer from '../common/MathRenderer';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  AlertTriangle,
  Lightbulb,
  RotateCcw,
  BookOpen,
  Filter,
  ChevronDown,
  ChevronUp,
  Brain,
  Sparkles,
} from 'lucide-react';

const QuizResultView = ({ evaluation, onRetake }) => {
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'mistakes' | 'correct'
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [expandedQuestions, setExpandedQuestions] = useState({});

  if (!evaluation) return null;

  const {
    score = 0,
    totalQuestions = 0,
    percentage = 0,
    correctAnswers = 0,
    incorrectAnswers = 0,
    unansweredQuestions = 0,
    questionResults = [],
    topicBreakdown = [],
    weakTopics = [],
    recommendations = [],
  } = evaluation;

  // Performance Tier Calculation
  let tierColor = 'text-emerald-600 bg-emerald-50 border-emerald-200';
  let tierBadge = 'Mastery Achieved';
  if (percentage < 60) {
    tierColor = 'text-rose-600 bg-rose-50 border-rose-200';
    tierBadge = 'Revision Needed';
  } else if (percentage < 80) {
    tierColor = 'text-amber-600 bg-amber-50 border-amber-200';
    tierBadge = 'Good Foundation';
  }

  // Filtered Question Results
  const filteredQuestions = questionResults.filter((q) => {
    // Mode filter
    if (filterMode === 'mistakes' && q.isCorrect) return false;
    if (filterMode === 'correct' && !q.isCorrect) return false;

    // Topic filter
    if (selectedTopic !== 'all' && q.topic !== selectedTopic) return false;

    return true;
  });

  const toggleExpand = (qId) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [qId]: !prev[qId],
    }));
  };

  const topicsList = Array.from(new Set(questionResults.map((q) => q.topic))).filter(Boolean);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Score Summary Banner */}
      <div className="bg-gradient-to-r from-[#2D4354] via-[#534145] to-[#20212B] rounded-3xl p-6 sm:p-8 text-white shadow-[0_16px_36px_-6px_rgba(45,67,84,0.25)] relative overflow-hidden border border-white/10 hover:border-white/20 transition-all duration-300 group">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-[#FED7A5]/20 blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
        <div className="absolute bottom-0 right-32 -mb-16 w-52 h-52 rounded-full bg-[#9E6752]/25 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border ${tierColor} backdrop-blur-md shadow-xs`}>
                <Award className="w-3.5 h-3.5" />
                {tierBadge}
              </span>
              <span className="text-xs text-white/75 font-medium">
                Evaluation Complete • Deterministic Answer Key
              </span>
            </div>

            <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
              Quiz Evaluation Results
            </h3>
            <p className="text-xs sm:text-sm text-white/90 max-w-xl leading-relaxed font-normal">
              Review your question breakdown, analyze mistake rationales, and check topic retention below.
            </p>
          </div>

          {/* Score Badge */}
          <div className="flex items-center gap-5 bg-white/10 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 shrink-0">
            <div className="text-center">
              <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                {percentage}%
              </span>
              <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mt-0.5">
                Accuracy
              </p>
            </div>
            <div className="h-10 w-[1px] bg-white/20" />
            <div className="text-center">
              <span className="text-4xl sm:text-5xl font-black text-blue-300 tracking-tight">
                {score}<span className="text-xl text-slate-400">/{totalQuestions}</span>
              </span>
              <p className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider mt-0.5">
                Score
              </p>
            </div>
          </div>
        </div>

        {/* Metric Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-3 text-center border border-white/5">
            <span className="text-xs text-slate-400 font-medium">Total Questions</span>
            <p className="text-lg font-bold text-white mt-0.5">{totalQuestions}</p>
          </div>
          <div className="bg-emerald-500/10 rounded-2xl p-3 text-center border border-emerald-500/20">
            <span className="text-xs text-emerald-300 font-medium">Correct</span>
            <p className="text-lg font-bold text-emerald-400 mt-0.5">{correctAnswers}</p>
          </div>
          <div className="bg-rose-500/10 rounded-2xl p-3 text-center border border-rose-500/20">
            <span className="text-xs text-rose-300 font-medium">Incorrect</span>
            <p className="text-lg font-bold text-rose-400 mt-0.5">{incorrectAnswers}</p>
          </div>
          <div className="bg-amber-500/10 rounded-2xl p-3 text-center border border-amber-500/20">
            <span className="text-xs text-amber-300 font-medium">Unanswered</span>
            <p className="text-lg font-bold text-amber-400 mt-0.5">{unansweredQuestions}</p>
          </div>
        </div>
      </div>

      {/* 2. Weak Topics & Revision Recommendations */}
      {topicBreakdown.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Brain className="w-4 h-4" />
              </div>
              <h4 className="text-base font-bold text-slate-900">Topic-Wise Performance Breakdown</h4>
            </div>
            {weakTopics.length > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                <AlertTriangle className="w-3 h-3 text-rose-600" />
                {weakTopics.length} Weak Area(s) Detected
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {topicBreakdown.map((t, idx) => {
              const isWeak = t.status === 'weak';
              const isStrong = t.status === 'strong';
              const bg = isWeak ? 'bg-rose-50 border-rose-200' : isStrong ? 'bg-emerald-50 border-emerald-200' : 'bg-slate-50 border-slate-200';
              const textColor = isWeak ? 'text-rose-700' : isStrong ? 'text-emerald-700' : 'text-slate-700';

              return (
                <div key={idx} className={`p-4 rounded-2xl border ${bg} flex flex-col justify-between space-y-2`}>
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-900 line-clamp-1">{t.topic}</span>
                    <span className={`text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full ${isWeak ? 'bg-rose-200 text-rose-800' : isStrong ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-200 text-slate-700'}`}>
                      {t.accuracy}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200/80 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${isWeak ? 'bg-rose-500' : isStrong ? 'bg-emerald-500' : 'bg-amber-500'}`}
                      style={{ width: `${t.accuracy}%` }}
                    />
                  </div>
                  <span className={`text-[11px] font-medium ${textColor}`}>
                    {t.correctAnswers} of {t.totalQuestions} correct
                  </span>
                </div>
              );
            })}
          </div>

          {/* Actionable recommendations */}
          {recommendations.length > 0 && (
            <div className="mt-4 p-4 rounded-2xl bg-blue-50/70 border border-blue-200/60 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-900">
                <Lightbulb className="w-4 h-4 text-blue-600" />
                <span>Diagnostic Study Recommendations</span>
              </div>
              <ul className="text-xs text-blue-800 space-y-1 pl-5 list-disc leading-relaxed">
                {recommendations.map((rec, i) => (
                  <li key={i}>
                    <MathRenderer text={rec} />
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 3. Interactive Mistake Review & Question Answers */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-base font-bold text-slate-900">Detailed Question & Mistake Analysis</h4>
            <p className="text-xs text-slate-500">
              Review your answers alongside official explanations and source definitions.
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="inline-flex p-1 rounded-xl bg-slate-100 border border-slate-200/70 text-xs font-semibold">
              <button
                onClick={() => setFilterMode('all')}
                className={`px-3 py-1.5 rounded-lg transition-all ${filterMode === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                All ({questionResults.length})
              </button>
              <button
                onClick={() => setFilterMode('mistakes')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${filterMode === 'mistakes' ? 'bg-white text-rose-600 shadow-xs' : 'text-slate-600 hover:text-rose-600'}`}
              >
                <XCircle className="w-3.5 h-3.5" />
                Mistakes ({incorrectAnswers + unansweredQuestions})
              </button>
              <button
                onClick={() => setFilterMode('correct')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${filterMode === 'correct' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-emerald-600'}`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Correct ({correctAnswers})
              </button>
            </div>

            {/* Topic Filter Dropdown */}
            {topicsList.length > 1 && (
              <select
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                className="text-xs font-semibold bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Topics</option>
                {topicsList.map((top, idx) => (
                  <option key={idx} value={top}>
                    {top}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Question Cards List */}
        {filteredQuestions.length === 0 ? (
          <div className="py-12 text-center text-slate-500 text-xs">
            No questions match your current filter selection.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredQuestions.map((q, idx) => {
              const isUnanswered = !q.selectedAnswer;
              const isWrong = !q.isCorrect && !isUnanswered;
              const isRight = q.isCorrect;

              return (
                <div
                  key={q.questionId || idx}
                  className={`p-5 rounded-2xl border transition-all ${isRight ? 'border-emerald-200/80 bg-emerald-50/20' : isWrong ? 'border-rose-200/80 bg-rose-50/20' : 'border-amber-200/80 bg-amber-50/20'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-400">
                          Q{idx + 1}
                        </span>
                        <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          {q.topic}
                        </span>
                        {isRight ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : isWrong ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-100/70 px-2 py-0.5 rounded-full">
                            <XCircle className="w-3.5 h-3.5" /> Incorrect
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded-full">
                            <HelpCircle className="w-3.5 h-3.5" /> Unanswered
                          </span>
                        )}
                      </div>

                      <h5 className="text-sm font-bold text-slate-900 pt-1 leading-snug">
                        <MathRenderer text={q.questionText} />
                      </h5>
                    </div>
                  </div>

                  {/* Options List */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-4">
                    {q.options.map((opt, optIdx) => {
                      const isChosen = q.selectedAnswer && q.selectedAnswer.toLowerCase() === opt.toLowerCase();
                      const isAnswerKey = q.correctAnswer && q.correctAnswer.toLowerCase() === opt.toLowerCase();

                      let optClass = 'bg-white border-slate-200 text-slate-700';
                      if (isAnswerKey) {
                        optClass = 'bg-emerald-500/10 border-emerald-500 text-emerald-900 font-semibold ring-1 ring-emerald-500';
                      } else if (isChosen && !isRight) {
                        optClass = 'bg-rose-500/10 border-rose-500 text-rose-900 font-semibold ring-1 ring-rose-500';
                      }

                      return (
                        <div
                          key={optIdx}
                          className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${optClass}`}
                        >
                          <span className="leading-snug">
                            <MathRenderer text={opt} />
                          </span>
                          {isAnswerKey && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                              Correct Answer
                            </span>
                          )}
                          {isChosen && !isRight && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                              Your Answer
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Section */}
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 leading-relaxed flex items-start gap-2.5">
                    <Lightbulb className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-800">Explanation: </span>
                      <span>
                        <MathRenderer text={q.explanation} />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Retake / Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <p className="text-xs text-slate-400">
            Finished reviewing? You can generate another quiz or retake with a new question set.
          </p>
          {onRetake && (
            <button
              onClick={onRetake}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition-all hover:scale-102"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Practice Another Quiz</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizResultView;
