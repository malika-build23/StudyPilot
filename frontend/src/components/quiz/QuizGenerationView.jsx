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
      <section className="bg-white rounded-3xl border border-[#73766A]/20 shadow-xs p-8 sm:p-10 text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5]/60 flex items-center justify-center mx-auto mb-3">
          <Brain className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-[#20212B]">
          Interactive Quizzes & Mock Tests
        </h4>
        <p className="text-xs text-[#73766A] mt-1.5 max-w-md mx-auto leading-relaxed">
          Upload PDF lecture notes, textbook chapters, or presentation slides for this subject. StudyPilot AI will extract key concepts and generate interactive quizzes and full-length mock exams.
        </p>
        {onUploadRequest && (
          <button
            onClick={onUploadRequest}
            className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#2D4354] hover:bg-[#20212B] text-white font-bold text-xs shadow-md shadow-[#2D4354]/20 transition-all cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-[#FED7A5]" />
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
    <section className="bg-white rounded-3xl border border-[#73766A]/20 shadow-xs overflow-hidden">
      {/* Header Banner */}
      <div className="p-5 sm:p-7 border-b border-[#73766A]/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5]/60 flex items-center justify-center shrink-0">
              <Brain className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-[#20212B]">
                  Interactive Quizzes & Mock Tests
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5]">
                  Active & Ready
                </span>
              </div>
              <p className="text-xs text-[#73766A] mt-0.5">
                Practice conceptual recall with AI-generated subject mock exams and diagnostic evaluations.
              </p>
            </div>
          </div>

          {/* Quiz Active Timer */}
          {quiz && isMockTest && timeLeft !== null && (
            <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border font-mono font-bold text-sm ${
              timeLeft < 120
                ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                : 'bg-[#FFF7EC] text-[#2D4354] border-[#FED7A5]'
            }`}>
              <Clock className="w-4 h-4 text-[#9E6752]" />
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
                <label className="block text-xs font-bold text-[#20212B] uppercase tracking-wider mb-2">
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
                  className="w-full px-4 py-3 rounded-2xl border border-[#73766A]/20 bg-white text-sm text-[#20212B] outline-none focus:border-[#2D4354] focus:ring-4 focus:ring-[#2D4354]/10 transition cursor-pointer"
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
                <label className="block text-xs font-bold text-[#20212B] uppercase tracking-wider">
                  Topic / Concept Focus (Optional)
                </label>
                <span className="text-[10px] text-[#73766A]">Leave blank for full material scope</span>
              </div>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Fourier Transform, Kirchhoff's Laws, Binary Trees..."
                className="w-full px-4 py-2.5 rounded-2xl border border-[#73766A]/20 bg-white text-sm text-[#20212B] placeholder-[#73766A]/60 outline-none focus:border-[#2D4354] focus:ring-4 focus:ring-[#2D4354]/10 transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Question Count */}
              <div>
                <label className="block text-xs font-bold text-[#20212B] uppercase tracking-wider mb-2">
                  Number of Questions
                </label>
                <select
                  value={questionCount}
                  onChange={(e) => setQuestionCount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-2xl border border-[#73766A]/20 bg-white text-sm text-[#20212B] outline-none focus:border-[#2D4354] focus:ring-4 focus:ring-[#2D4354]/10 transition cursor-pointer"
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
                <label className="block text-xs font-bold text-[#20212B] uppercase tracking-wider mb-2">
                  Exam Format Mode
                </label>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setIsMockTest(false)}
                    className={`flex-1 py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all cursor-pointer ${
                      !isMockTest
                        ? 'border-[#2D4354] bg-[#2D4354] text-[#FED7A5] shadow-xs'
                        : 'border-[#73766A]/20 text-[#73766A] bg-white hover:bg-[#FAF8F5]'
                    }`}
                  >
                    Standard Practice
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsMockTest(true)}
                    className={`flex-1 py-2.5 px-3 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isMockTest
                        ? 'border-[#2D4354] bg-[#2D4354] text-[#FED7A5] shadow-xs'
                        : 'border-[#73766A]/20 text-[#73766A] bg-white hover:bg-[#FAF8F5]'
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
              <label className="block text-xs font-bold text-[#20212B] uppercase tracking-wider mb-2">
                Difficulty Level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {['easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setDifficulty(level)}
                    className={`py-2.5 rounded-2xl border text-xs font-bold capitalize transition-all cursor-pointer ${
                      difficulty === level
                        ? 'border-[#2D4354] bg-[#2D4354] text-[#FED7A5] ring-2 ring-[#FED7A5]/50 shadow-xs'
                        : 'border-[#73766A]/20 text-[#73766A] bg-white hover:bg-[#FAF8F5]'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#FFF7EC] border border-[#FED7A5] flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#9E6752] mt-0.5 shrink-0" />
              <div className="text-xs text-[#20212B] leading-relaxed">
                <span className="font-bold text-[#2D4354]">Test Configuration:</span> Generating {questionCount}{' '}
                {difficulty} questions
                {topic ? ` focused on "${topic}"` : ''}
                {isMockTest ? ` with a strict ${questionCount * 2}-minute time limit` : ''}.
              </div>
            </div>

            <button
              onClick={handleGenerateQuiz}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#2D4354] hover:bg-[#20212B] disabled:opacity-60 text-white text-sm font-extrabold transition-all shadow-md shadow-[#2D4354]/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#FED7A5]" />
                  <span>Synthesizing Exam Questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-[#FED7A5]" />
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
                <p className="text-xs font-bold text-[#2D4354] uppercase tracking-wider">
                  QUESTION {currentIndex + 1} OF {quiz.questions.length}
                </p>
                <p className="text-xs text-[#73766A] mt-0.5 capitalize">
                  {quiz.difficulty} difficulty • Topic: <span className="font-semibold text-[#20212B]">{currentQuestion.topic}</span>
                </p>
              </div>
              <span className="text-xs font-semibold text-[#2D4354] bg-[#FFF7EC] border border-[#FED7A5] px-2.5 py-1 rounded-full">
                {answeredCount}/{quiz.questions.length} answered
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full h-2 bg-[#FAF8F5] border border-[#73766A]/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#2D4354] via-[#534145] to-[#9E6752] rounded-full transition-all duration-300"
                style={{
                  width: `${((currentIndex + 1) / quiz.questions.length) * 100}%`,
                }}
              />
            </div>

            {/* Question Text Box */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#FAF8F5] border border-[#73766A]/15">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[#9E6752] mb-2">
                <MathRenderer text={currentQuestion.topic} />
              </div>
              <h4 className="text-base sm:text-lg font-bold text-[#20212B] leading-relaxed">
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
                    className={`w-full flex items-center gap-3 p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                      selected
                        ? 'border-[#2D4354] bg-[#FFF7EC] text-[#20212B] ring-1 ring-[#FED7A5]'
                        : 'border-[#73766A]/20 hover:border-[#2D4354]/40 hover:bg-[#FAF8F5] text-[#20212B]'
                    }`}
                  >
                    <span className={`w-7 h-7 shrink-0 rounded-xl flex items-center justify-center text-xs font-bold ${
                      selected
                        ? 'bg-[#2D4354] text-[#FED7A5]'
                        : 'bg-white text-[#73766A] border border-[#73766A]/20'
                    }`}>
                      {String.fromCharCode(65 + index)}
                    </span>
                    <span className="text-sm font-medium">
                      <MathRenderer text={option} />
                    </span>
                    {selected && (
                      <CheckCircle2 className="w-4 h-4 ml-auto text-[#9E6752] shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Navigation */}
            <div className="flex items-center justify-between gap-3 pt-3 border-t border-[#73766A]/15">
              <button
                type="button"
                onClick={() => setCurrentIndex((index) => index - 1)}
                disabled={currentIndex === 0 || submitting}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl border border-[#73766A]/20 text-xs font-bold text-[#20212B] hover:bg-[#FAF8F5] disabled:opacity-40 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </button>

              {currentIndex < quiz.questions.length - 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentIndex((index) => index + 1)}
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-2xl bg-[#2D4354] hover:bg-[#20212B] text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4 text-[#FED7A5]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleSubmitQuiz(false)}
                  disabled={submitting || answeredCount !== quiz.questions.length}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#9E6752] hover:bg-[#855442] text-xs font-bold text-white disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-[#FED7A5]" />
                      <span>Evaluating Answers...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-[#FED7A5]" />
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
