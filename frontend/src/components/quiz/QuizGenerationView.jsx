
import { useEffect, useState } from 'react';
import {
  quizAPI,
  evaluationAPI,
} from '../../services/api';
import QuizResultView from './QuizResultView';
import MathRenderer from '../common/MathRenderer';
import {
  Brain,
  Sparkles,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertCircle,
  FileQuestion,
  RotateCcw,
} from 'lucide-react';

const QuizGenerationView = ({ subjectId, material }) => {
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');

  const [quiz, setQuiz] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    setQuiz(null);
    setEvaluation(null);
    setCurrentIndex(0);
    setAnswers({});
    setError('');
    setSuccess('');
  }, [material?._id]);

  const handleGenerateQuiz = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setQuiz(null);
      setAnswers({});
      setCurrentIndex(0);

      const res = await quizAPI.generate({
        subjectId,
        materialId: material._id,
        questionCount: Number(questionCount),
        difficulty,
      });

      if (res.data?.success) {
        setQuiz(res.data.data);
      } else {
        setError(res.data?.message || 'Unable to generate quiz.');
      }
    } catch (err) {
      console.error('Quiz generation error:', err);
      setError(
        err.response?.data?.message ||
        'Quiz generation failed. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId, selectedAnswer) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: selectedAnswer,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (!quiz) return;

    const allAnswered = quiz.questions.every(
      (question) => answers[question.questionId]
    );

    if (!allAnswered) {
      setError('Please answer all questions before submitting.');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to submit your quiz? You cannot change your answers afterwards.'
    );

    if (!confirmed) return;

    try {
      setSubmitting(true);
      setError('');

      const formattedAnswers = quiz.questions.map((question) => ({
        questionId: question.questionId,
        selectedAnswer: answers[question.questionId],
      }));

      const res = await quizAPI.submit(quiz._id, formattedAnswers);

      if (res.data?.success) {
        const attemptId = res.data.data?.attemptId;
        if (attemptId) {
          try {
            // Automatic Answer Evaluation (Phase 3 Part B)
            const evalRes = await evaluationAPI.evaluate(attemptId);
            if (evalRes.data?.success) {
              setEvaluation(evalRes.data.data);
              setQuiz(null);
              setAnswers({});
              setCurrentIndex(0);
              return;
            }
          } catch (evalErr) {
            console.warn('Evaluation fallback warning:', evalErr);
          }
        }

        setSuccess('Your quiz has been submitted and your attempt has been saved successfully.');
        setQuiz(null);
        setAnswers({});
        setCurrentIndex(0);
      }
    } catch (err) {
      console.error('Quiz submission error:', err);
      setError(
        err.response?.data?.message ||
        'Failed to submit quiz. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestart = () => {
    setQuiz(null);
    setEvaluation(null);
    setAnswers({});
    setCurrentIndex(0);
    setError('');
    setSuccess('');
  };

  const currentQuestion = quiz?.questions[currentIndex];
  const answeredCount = quiz
    ? quiz.questions.filter(
        (question) => answers[question.questionId]
      ).length
    : 0;

  if (!material) return null;

  if (evaluation) {
    return (
      <QuizResultView
        evaluation={evaluation}
        onRetake={handleRestart}
      />
    );
  }

  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-5 sm:p-7 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Brain className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-slate-900">
                AI Quiz Generator
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                Phase 3 · Part A
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Generate practice questions from your uploaded study material.
            </p>
          </div>
        </div>

        <div className="mt-5 p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-center gap-2">
          <FileQuestion className="w-4 h-4 text-indigo-500 shrink-0" />
          <p className="text-xs text-slate-600 truncate">
            Source: <span className="font-semibold text-slate-800">{material.fileName}</span>
          </p>
        </div>
      </div>

      <div className="p-5 sm:p-7">
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2 text-red-700">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p className="text-xs">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-100 flex items-start gap-3 text-emerald-700">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Submission successful!</p>
              <p className="text-xs mt-1">{success}</p>
              <button
                onClick={handleRestart}
                className="mt-3 text-xs font-bold underline underline-offset-2"
              >
                Generate another quiz
              </button>
            </div>
          </div>
        )}

        {!quiz && !success && (
          <div className="space-y-5">
            {material.processingStatus !== 'completed' ? (
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-100 text-amber-800 text-xs">
                This document is not ready yet. Wait until its processing is completed before generating a quiz.
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Number of Questions
                  </label>
                  <select
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                  >
                    {[5, 10, 15, 20, 25, 30].map((count) => (
                      <option key={count} value={count}>
                        {count} Questions
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-2">
                    Difficulty Level
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['easy', 'medium', 'hard'].map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setDifficulty(level)}
                        className={`py-3 rounded-xl border text-xs font-semibold capitalize transition-all ${
                          difficulty === level
                            ? 'border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100">
                  <div className="flex items-center gap-2 text-indigo-700">
                    <Sparkles className="w-4 h-4" />
                    <span className="text-xs font-bold">Your quiz is ready to configure</span>
                  </div>
                  <p className="text-xs text-indigo-700/80 mt-1.5 leading-relaxed">
                    Gemini AI will create {questionCount} {difficulty} difficulty MCQs using the selected document.
                  </p>
                </div>

                <button
                  onClick={handleGenerateQuiz}
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold transition-all shadow-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generating your quiz...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Generate Quiz
                    </>
                  )}
                </button>
              </>
            )}
          </div>
        )}

        {quiz && currentQuestion && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-indigo-600">
                  QUESTION {currentIndex + 1} OF {quiz.questions.length}
                </p>
                <p className="text-xs text-slate-500 mt-1 capitalize">
                  {quiz.difficulty} difficulty
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600">
                {answeredCount}/{quiz.questions.length} answered
              </span>
            </div>

            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / quiz.questions.length) * 100}%`,
                }}
              />
            </div>

            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-3">
                {currentQuestion.topic}
              </p>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                <MathRenderer text={currentQuestion.questionText} />
              </h4>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => {
                const selected = answers[currentQuestion.questionId] === option;

                return (
                  <button
                    key={`${currentQuestion.questionId}-${index}`}
                    type="button"
                    onClick={() => handleSelectAnswer(currentQuestion.questionId, option)}
                    className={`w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                      selected
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                        : 'border-slate-200 hover:border-indigo-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <span className={`w-7 h-7 shrink-0 rounded-lg flex items-center justify-center text-xs font-bold ${
                      selected
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-sm font-medium">
                      <MathRenderer text={option} />
                    </span>
                    {selected && (
                      <CheckCircle2 className="w-4 h-4 ml-auto text-indigo-600 shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentIndex((index) => index - 1)}
                disabled={currentIndex === 0 || submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {currentIndex < quiz.questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((index) => index + 1)}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitQuiz}
                  disabled={submitting || answeredCount !== quiz.questions.length}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Submit Quiz
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{answeredCount} questions answered</span>
              <button
                type="button"
                onClick={handleRestart}
                disabled={submitting}
                className="inline-flex items-center gap-1 hover:text-slate-700 disabled:opacity-40"
              >
                <RotateCcw className="w-3 h-3" />
                Cancel quiz
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default QuizGenerationView;
