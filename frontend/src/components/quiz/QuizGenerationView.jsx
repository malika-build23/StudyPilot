import { useEffect, useState, useRef } from 'react';
import { quizAPI, evaluationAPI } from '../../services/api';
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
  Clock,
  Layers,
  BookOpen,
  UploadCloud,
} from 'lucide-react';

const QuizGenerationView = ({
  subjectId,
  material = null,
  materials = [],
  onSelectMaterial = null,
  onUploadRequest = null,
}) => {
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState('medium');
  const [topic, setTopic] = useState('');
  const [isMockTest, setIsMockTest] = useState(false);
  const [selectedMatId, setSelectedMatId] = useState(material?._id || 'all');

  const [quiz, setQuiz] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Timed mock test state
  const [timeLeft, setTimeLeft] = useState(null);
  const timerRef = useRef(null);

  // Synchronize when material prop changes
  useEffect(() => {
    if (material?._id) {
      setSelectedMatId(material._id);
    } else if (materials.length > 0 && selectedMatId === 'all') {
      setSelectedMatId('all');
    }
  }, [material?._id, materials.length]);

  // Handle Mock Test Countdown Timer
  useEffect(() => {
    if (!quiz || !isMockTest || timeLeft === null) return;

    if (timeLeft <= 0) {
      clearInterval(timerRef.current);
      alert('Mock test time has expired! Automatically submitting your answers.');
      handleSubmitQuiz(true);
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [quiz, isMockTest, timeLeft]);

  const formatTimer = (seconds) => {
    if (seconds === null) return '00:00';
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleGenerateQuiz = async () => {
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      setQuiz(null);
      setAnswers({});
      setCurrentIndex(0);

      const targetMaterialId = selectedMatId === 'all' ? undefined : selectedMatId;

      const res = await quizAPI.generate({
        subjectId,
        materialId: targetMaterialId || 'all',
        questionCount: Number(questionCount),
        difficulty,
        topic: topic.trim() || undefined,
      });

      if (res.data?.success) {
        setQuiz(res.data.data);
        if (isMockTest) {
          // 2 minutes per question for mock test
          setTimeLeft(Number(questionCount) * 120);
        } else {
          setTimeLeft(null);
        }
      } else {
        setError(res.data?.message || 'Unable to generate quiz.');
      }
    } catch (err) {
      console.error('Quiz generation error:', err);
      setError(
        err.response?.data?.message ||
        'Quiz generation failed. Please ensure at least one document is processed.'
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

  const handleSubmitQuiz = async (forceSubmit = false) => {
    if (!quiz) return;

    const allAnswered = quiz.questions.every(
      (question) => answers[question.questionId]
    );

    if (!allAnswered && !forceSubmit) {
      setError('Please answer all questions before submitting.');
      return;
    }

    if (!forceSubmit) {
      const confirmed = window.confirm(
        'Are you sure you want to submit your quiz? You cannot change your answers afterwards.'
      );
      if (!confirmed) return;
    }

    try {
      setSubmitting(true);
      setError('');

      if (timerRef.current) clearInterval(timerRef.current);

      const formattedAnswers = quiz.questions.map((question) => ({
        questionId: question.questionId,
        selectedAnswer: answers[question.questionId] || '',
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
    if (timerRef.current) clearInterval(timerRef.current);
    setQuiz(null);
    setEvaluation(null);
    setAnswers({});
    setCurrentIndex(0);
    setTimeLeft(null);
    setError('');
    setSuccess('');
  };

  const completedMaterials = materials.filter((m) => m.processingStatus === 'completed');

  if (evaluation) {
    return (
      <QuizResultView
        evaluation={evaluation}
        onRetake={handleRestart}
      />
    );
  }

  // If no materials available and no material selected
  if (!material && materials.length === 0) {
    return (
      <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-8 sm:p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
          <Brain className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-slate-900">
          Interactive Quizzes & Mock Tests
        </h4>
        <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
          Upload PDF lecture notes, textbook chapters, or presentation slides for this subject. StudyPilot AI will extract key concepts and generate interactive quizzes and full-length mock exams.
        </p>
        {onUploadRequest && (
          <button
            onClick={onUploadRequest}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs transition-all"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload Document to Start</span>
          </button>
        )}
      </section>
    );
  }

  const currentQuestion = quiz?.questions[currentIndex];
  const answeredCount = quiz
    ? quiz.questions.filter((question) => answers[question.questionId]).length
    : 0;

  return (
    <section className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
      {/* Header Banner */}
      <div className="p-5 sm:p-7 border-b border-slate-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-slate-900">
                  Interactive Quizzes & Mock Tests
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Active & Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Practice conceptual recall with AI-generated subject mock exams and diagnostic evaluations.
              </p>
            </div>
          </div>

          {/* Quiz Active Timer */}
          {quiz && isMockTest && timeLeft !== null && (
            <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border font-mono font-bold text-sm ${
              timeLeft < 120
                ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}>
              <Clock className="w-4 h-4" />
              <span>Time Remaining: {formatTimer(timeLeft)}</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-5 sm:p-7">
        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-100 flex items-start gap-2 text-red-700">
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
            {/* Source Material Selection */}
            {completedMaterials.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Test Coverage / Source Document
                </label>
                <select
                  value={selectedMatId}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSelectedMatId(val);
                    if (onSelectMaterial) {
                      const found = completedMaterials.find((m) => m._id === val);
                      if (found) onSelectMaterial(found);
                    }
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="all">
                    📚 Full Course Mock Test (Aggregate All {completedMaterials.length} Documents)
                  </option>
                  {completedMaterials.map((mat) => (
                    <option key={mat._id} value={mat._id}>
                      📄 Single Document: {mat.fileName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Optional Topic Input for Topic-wise Quizzes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-slate-700">
                  Topic / Concept Focus (Optional)
                </label>
                <span className="text-[10px] text-slate-400">Leave blank for full material scope</span>
              </div>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Fourier Transform, Kirchhoff's Laws, Binary Trees..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Question Count */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Number of Questions
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                >
                  {[5, 10, 15, 20, 25, 30].map((count) => (
                    <option key={count} value={count}>
                      {count} Questions
                    </option>
                  ))}
                </select>
              </div>

              {/* Mock Test Mode Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2">
                  Exam Format Mode
                </label>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsMockTest(false)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      !isMockTest
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Standard Practice
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMockTest(true)}
                    className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      isMockTest
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Clock className="w-3.5 h-3.5" />
                    <span>Timed Mock Test</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Difficulty Level */}
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
                    className={`py-2.5 rounded-xl border text-xs font-semibold capitalize transition-all ${
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

            <div className="p-4 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-indigo-600 mt-0.5 shrink-0" />
              <div className="text-xs text-indigo-900 leading-relaxed">
                <span className="font-bold">Test Configuration:</span> Generating {questionCount}{' '}
                {difficulty} questions
                {topic ? ` focused on "${topic}"` : ''}
                {isMockTest ? ` with a strict ${questionCount * 2}-minute time limit` : ''}.
              </div>
            </div>

            <button
              onClick={handleGenerateQuiz}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-bold transition-all shadow-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Exam Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>{isMockTest ? 'Start Timed Mock Test' : 'Generate Practice Quiz'}</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Live Quiz Taking Mode */}
        {quiz && currentQuestion && (
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  QUESTION {currentIndex + 1} OF {quiz.questions.length}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 capitalize">
                  {quiz.difficulty} difficulty • Topic: <span className="font-semibold text-slate-700">{currentQuestion.topic}</span>
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                {answeredCount}/{quiz.questions.length} answered
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / quiz.questions.length) * 100}%`,
                }}
              />
            </div>

            {/* Question Text Box */}
            <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 mb-2">
                {currentQuestion.topic}
              </p>
              <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
                <MathRenderer text={currentQuestion.questionText} />
              </h4>
            </div>

            {/* Options */}
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
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-800 ring-1 ring-indigo-200'
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

            {/* Bottom Navigation */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setCurrentIndex((index) => index - 1)}
                disabled={currentIndex === 0 || submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentIndex < quiz.questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((index) => index + 1)}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-xs font-semibold text-white transition-colors"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSubmitQuiz(false)}
                  disabled={submitting || answeredCount !== quiz.questions.length}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-semibold text-white disabled:opacity-50 transition-colors shadow-xs"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Evaluating Answers...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit & Grade Exam</span>
                    </>
                  )}
                </button>
              )}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{answeredCount} of {quiz.questions.length} answered</span>
              <button
                type="button"
                onClick={handleRestart}
                disabled={submitting}
                className="inline-flex items-center gap-1 hover:text-slate-700 disabled:opacity-40 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Cancel test</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default QuizGenerationView;
