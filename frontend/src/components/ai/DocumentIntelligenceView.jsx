import { useState, useEffect } from 'react';
import { aiAPI } from '../../services/api';
import MathRenderer from '../common/MathRenderer';
import {
  Sparkles,
  BookOpen,
  Brain,
  MessageSquareText,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sigma,
  Layers,
  ChevronDown,
  ChevronUp,
  Send,
  HelpCircle as QuestionIcon
} from 'lucide-react';

const DocumentIntelligenceView = ({ material, onClose }) => {
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('summary'); // summary | concepts | formulas | questions | topics | ask

  // Ask Question state
  const [questionInput, setQuestionInput] = useState('');
  const [asking, setAsking] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatError, setChatError] = useState('');

  // Expandable question answers
  const [expandedQuestions, setExpandedQuestions] = useState({});

  // Analysis progress milestones
  const [analysisStage, setAnalysisStage] = useState(0);
  const stages = [
    'Reading & segmenting document pages...',
    'Extracting chapter structures & learning objectives...',
    'Identifying core academic concepts & definitions...',
    'Extracting mathematical formulas & algorithmic rules...',
    'Synthesizing exam questions & model revision answers...',
    'Compiling final intelligence workspace...',
  ];

  useEffect(() => {
    let interval;
    if (analyzing) {
      setAnalysisStage(0);
      interval = setInterval(() => {
        setAnalysisStage((prev) => (prev < stages.length - 1 ? prev + 1 : prev));
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [analyzing, stages.length]);

  const fetchExistingAnalysis = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await aiAPI.getAnalysis(material._id);
      if (res.data?.success && res.data.data) {
        setAnalysis(res.data.data);
      } else {
        setAnalysis(null);
      }
    } catch (err) {
      console.error('Error fetching analysis:', err);
      setError('Failed to load existing document analysis.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (material?._id) {
      fetchExistingAnalysis();
      setChatMessages([]);
      setActiveTab('summary');
    }
  }, [material?._id]);

  const handleGenerateAnalysis = async () => {
    try {
      setAnalyzing(true);
      setError('');
      const res = await aiAPI.analyseMaterial(material._id);
      if (res.data?.success && res.data.data) {
        setAnalysis(res.data.data);
      }
    } catch (err) {
      console.error('Analysis generation failed:', err);
      setError(
        err.response?.data?.message ||
          'Gemini AI analysis failed. Please verify document has text content.'
      );
    } finally {
      setAnalyzing(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!questionInput.trim() || asking) return;

    const q = questionInput.trim();
    setQuestionInput('');
    setChatError('');
    setAsking(true);

    // Optimistically add student's message
    const tempUserMsg = { sender: 'student', text: q, timestamp: new Date() };
    setChatMessages((prev) => [...prev, tempUserMsg]);

    try {
      const res = await aiAPI.askQuestion(material._id, q);
      if (res.data?.success && res.data.data) {
        const aiMsg = {
          sender: 'ai',
          text: res.data.data.answer,
          sources: res.data.data.relevantSources || [],
          isCovered: res.data.data.isCoveredInDocument,
          timestamp: new Date(),
        };
        setChatMessages((prev) => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error('Ask question error:', err);
      const errMsg = err.response?.data?.message || 'Failed to get answer from Gemini.';
      setChatError(errMsg);
    } finally {
      setAsking(false);
    }
  };

  const toggleQuestionAnswer = (idx) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [idx]: !prev[idx],
    }));
  };

  const tabs = [
    { id: 'summary', label: 'Chapter Summaries', icon: BookOpen, count: analysis?.chapters?.length },
    { id: 'concepts', label: 'Key Concepts', icon: Brain, count: analysis?.importantConcepts?.length },
    { id: 'formulas', label: 'Formulas & Rules', icon: Sigma, count: analysis?.formulas?.length },
    { id: 'questions', label: 'Question Bank', icon: QuestionIcon, count: analysis?.importantQuestions?.length },
    { id: 'topics', label: 'Topic Syllabus', icon: Layers, count: analysis?.topics?.length },
    { id: 'ask', label: 'Ask AI Doubt Solver', icon: MessageSquareText },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden animate-in fade-in duration-200">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 p-6 sm:p-7 text-white">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-blue-100 text-[11px] font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-200" />
              <span>Gemini 2.5 Flash Document Intelligence</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight truncate max-w-xl">
              {material.fileName}
            </h3>
            <p className="text-xs text-blue-100/80">
              AI-generated academic summaries, core concept breakdowns, formulas, and revision prompts.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {analysis && (
              <button
                onClick={handleGenerateAnalysis}
                disabled={analyzing}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white font-medium text-xs backdrop-blur-xs transition-all disabled:opacity-50"
                title="Regenerate with fresh Gemini analysis"
              >
                <RotateCcw className={`w-3.5 h-3.5 ${analyzing ? 'animate-spin' : ''}`} />
                <span>{analyzing ? 'Re-analyzing...' : 'Regenerate'}</span>
              </button>
            )}
            {onClose && (
              <button
                onClick={onClose}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                Close View
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="m-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium flex items-start gap-3">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Analysis Error</p>
            <p className="mt-0.5 text-red-600">{error}</p>
          </div>
        </div>
      )}

      {/* Main Content: Loading, Empty (Not Analyzed Yet), or Analyzed Tabs */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <p className="text-xs text-slate-500 font-medium">Checking document intelligence...</p>
        </div>
      ) : analyzing ? (
        <div className="py-20 px-6 text-center max-w-md mx-auto space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto shadow-inner">
            <Sparkles className="w-8 h-8 animate-spin text-blue-600" />
          </div>
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200/60 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-ping" />
              Step {analysisStage + 1} of {stages.length}
            </span>
            <h4 className="text-base font-bold text-slate-900 transition-all duration-300">
              {stages[analysisStage]}
            </h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Transforming raw slides & pages into structured chapters, formulas, and revision questions.
            </p>
          </div>
          <div className="w-64 mx-auto space-y-1.5">
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.round(((analysisStage + 1) / stages.length) * 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 font-medium">
              Takes ~10–25s depending on document length
            </p>
          </div>
        </div>
      ) : !analysis ? (
        <div className="py-16 px-6 text-center max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-3xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Brain className="w-8 h-8" />
          </div>
          <h4 className="text-lg font-bold text-slate-900">
            Generate AI Document Intelligence
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
            Transform "{material.fileName}" into structured chapter breakdowns, definitions, formulas, and practice test prompts powered by Google Gemini.
          </p>
          <button
            onClick={handleGenerateAnalysis}
            className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-md shadow-blue-500/25 transition-all hover:scale-102"
          >
            <Sparkles className="w-4 h-4" />
            <span>Generate Comprehensive Analysis</span>
          </button>
        </div>
      ) : (
        <div>
          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto border-b border-slate-200/80 px-6 pt-3 bg-slate-50/50">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold transition-all shrink-0 ${
                    isActive
                      ? 'border-blue-600 text-blue-600 bg-white rounded-t-xl shadow-xs'
                      : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                  {tab.count !== undefined && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                        isActive ? 'bg-blue-100 text-blue-700' : 'bg-slate-200/80 text-slate-600'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Tab Body View */}
          <div className="p-6 sm:p-8">
            {/* TAB 1: CHAPTER SUMMARIES */}
            {activeTab === 'summary' && (
              <div className="space-y-6">
                {/* Executive Summary Card */}
                <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Executive Document Overview</span>
                  </h4>
                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                    {analysis.summary}
                  </p>
                </div>

                {/* Chapter-wise Breakdown */}
                <div className="space-y-5">
                  <h4 className="text-sm font-bold text-slate-900">
                    Chapter & Module Breakdowns ({analysis.chapters?.length || 0})
                  </h4>

                  {analysis.chapters?.map((ch, idx) => (
                    <div
                      key={idx}
                      className="p-5 sm:p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-4"
                    >
                      <div className="border-b border-slate-100 pb-3">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                          Module {idx + 1}
                        </span>
                        <h5 className="text-base font-bold text-slate-900 mt-1">
                          {ch.chapterTitle}
                        </h5>
                        <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                          {ch.chapterSummary}
                        </p>
                      </div>

                      {/* Subtopic Explanations */}
                      {ch.simpleExplanations && ch.simpleExplanations.length > 0 && (
                        <div className="space-y-2.5">
                          <h6 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                            Key Explanations & Concepts
                          </h6>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {ch.simpleExplanations.map((exp, eIdx) => (
                              <div
                                key={eIdx}
                                className="p-3.5 rounded-xl bg-slate-50 border border-slate-100"
                              >
                                <p className="text-xs font-bold text-slate-900">
                                  {exp.subtopic}
                                </p>
                                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                                  {exp.explanation}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Key Takeaways */}
                      {ch.keyTakeaways && ch.keyTakeaways.length > 0 && (
                        <div className="pt-2">
                          <h6 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                            Key Takeaways
                          </h6>
                          <ul className="space-y-1.5">
                            {ch.keyTakeaways.map((point, pIdx) => (
                              <li
                                key={pIdx}
                                className="flex items-start gap-2 text-xs text-slate-700"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                                <span>{point}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 2: KEY CONCEPTS */}
            {activeTab === 'concepts' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      Core Academic Concepts & Terminology
                    </h4>
                    <p className="text-xs text-slate-500">
                      High-yield definitions and conceptual mechanisms identified by Gemini AI
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.importantConcepts?.map((concept, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:border-blue-300 transition-all space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                          {concept.relevantChapter || 'Concept'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {concept.relatedTopic}
                        </span>
                      </div>

                      <h5 className="text-sm font-bold text-slate-900">
                        {concept.conceptName}
                      </h5>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                        <span className="font-semibold text-slate-900 font-sans">Def: </span>
                        <MathRenderer text={concept.definition} />
                      </div>

                      <div className="text-xs text-slate-600 leading-relaxed pt-1">
                        <MathRenderer text={concept.explanation} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: FORMULAS & RULES */}
            {activeTab === 'formulas' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Extracted Formulas & Equations
                  </h4>
                  <p className="text-xs text-slate-500">
                    Mathematical relationships and scientific expressions explicitly identified in source material
                  </p>
                </div>

                {analysis.formulas && analysis.formulas.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysis.formulas.map((form, idx) => (
                      <div
                        key={idx}
                        className="p-5 sm:p-6 rounded-2xl border border-slate-200/90 bg-white shadow-xs hover:border-blue-300 hover:shadow-sm transition-all space-y-3.5 flex flex-col justify-between"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-start justify-between gap-2">
                            <h5 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                              {form.formulaName}
                            </h5>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 shrink-0">
                              {form.relevantChapter || 'Formula'}
                            </span>
                          </div>
                          {form.relatedTopic && (
                            <p className="text-[11px] text-slate-400 font-medium">
                              Topic: {form.relatedTopic}
                            </p>
                          )}
                        </div>

                        {/* Dedicated Clean Mathematical Area */}
                        <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/80 border border-slate-100 flex items-center justify-center min-h-[96px] shadow-2xs overflow-x-auto text-slate-900">
                          <MathRenderer
                            expression={form.expression}
                            displayMode={true}
                            className="text-base sm:text-lg text-slate-900 font-medium"
                          />
                        </div>

                        {form.explanationOfVariables && (
                          <div className="pt-2 text-xs text-slate-600 leading-relaxed border-t border-slate-100 flex items-start gap-1.5">
                            <span className="font-semibold text-slate-800 shrink-0">Variables: </span>
                            <span className="text-slate-600">
                              <MathRenderer text={form.explanationOfVariables} />
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-10 rounded-2xl bg-slate-50 border border-slate-200/70 text-center max-w-md mx-auto">
                    <Sigma className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <h5 className="text-sm font-bold text-slate-800">
                      No mathematical formulas in this document
                    </h5>
                    <p className="text-xs text-slate-500 mt-1">
                      Per StudyPilot AI rules, formulas are only extracted when present in the source text and are never fabricated.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: QUESTION BANK */}
            {activeTab === 'questions' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      Practice & Diagnostic Question Bank
                    </h4>
                    <p className="text-xs text-slate-500">
                      Review prompts classified by cognitive type, difficulty, and source
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 italic">
                    * Practice aids; not official exam leaks
                  </span>
                </div>

                <div className="space-y-3">
                  {analysis.importantQuestions?.map((q, idx) => {
                    const isExpanded = expandedQuestions[idx];
                    return (
                      <div
                        key={idx}
                        className="p-4 sm:p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-blue-700">
                                {q.questionType}
                              </span>
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                                  q.difficulty === 'easy'
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : q.difficulty === 'hard'
                                    ? 'bg-red-50 text-red-700'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {q.difficulty}
                              </span>
                              <span className="text-[10px] font-medium text-slate-400">
                                {q.sourceClassification === 'source_extracted'
                                  ? 'From Source Material'
                                  : 'AI Practice Prompt'}
                              </span>
                            </div>

                            <div className="text-sm font-bold text-slate-900 pt-1 leading-snug">
                              <span>{idx + 1}. </span>
                              <MathRenderer text={q.questionText} />
                            </div>
                          </div>

                          <button
                            onClick={() => toggleQuestionAnswer(idx)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 shrink-0 pt-1"
                          >
                            <span>{isExpanded ? 'Hide Answer' : 'Show Answer'}</span>
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>

                        {/* Collapsible Model Answer */}
                        {isExpanded && (
                          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed animate-in fade-in duration-150">
                            <span className="font-bold text-slate-900 block mb-1">
                              Model Explanation / Suggested Answer:
                            </span>
                            <MathRenderer
                              text={
                                q.suggestedAnswer ||
                                'Review the relevant chapter section to formulate your response.'
                              }
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB 5: TOPIC CLASSIFICATION */}
            {activeTab === 'topics' && (
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Hierarchical Syllabus Classification
                  </h4>
                  <p className="text-xs text-slate-500">
                    Syllabus tree mapping for adaptive quiz generation and diagnostic tracking
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analysis.topics?.map((top, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-2xl border border-slate-200/90 bg-white shadow-xs space-y-3"
                    >
                      <h5 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">
                        {top.chapterName}
                      </h5>

                      <div className="space-y-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Primary Topics
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {top.topics?.map((t, tIdx) => (
                            <span
                              key={tIdx}
                              className="text-xs px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 font-medium"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      {top.subtopics && top.subtopics.length > 0 && (
                        <div className="space-y-1.5 pt-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                            Subtopics
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {top.subtopics.map((st, stIdx) => (
                              <span
                                key={stIdx}
                                className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-normal"
                              >
                                {st}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 6: ASK ABOUT THIS DOCUMENT (AI DOUBT SOLVER) */}
            {activeTab === 'ask' && (
              <div className="space-y-5">
                <div>
                  <h4 className="text-base font-bold text-slate-900">
                    Ask About This Document (AI Doubt Solver)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Ask Gemini AI anything regarding "{material.fileName}". Answers are prioritized using this document's text with page/slide references.
                  </p>
                </div>

                {chatError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                    {chatError}
                  </div>
                )}

                {/* Chat History Container */}
                <div className="min-h-[220px] max-h-[420px] overflow-y-auto space-y-3 p-4 rounded-2xl bg-slate-50/70 border border-slate-200/80">
                  {chatMessages.length === 0 ? (
                    <div className="py-12 text-center text-xs text-slate-400">
                      <MessageSquareText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                      <p className="font-semibold text-slate-600">No questions asked yet.</p>
                      <p className="mt-1">
                        Try asking: "Explain the main concept in simple terms" or "What is the key takeaway of slide 3?"
                      </p>
                    </div>
                  ) : (
                    chatMessages.map((msg, mIdx) => (
                      <div
                        key={mIdx}
                        className={`flex flex-col ${
                          msg.sender === 'student' ? 'items-end' : 'items-start'
                        }`}
                      >
                        <div
                          className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                            msg.sender === 'student'
                              ? 'bg-blue-600 text-white rounded-tr-xs'
                              : 'bg-white border border-slate-200/90 text-slate-800 rounded-tl-xs shadow-xs'
                          }`}
                        >
                          <div className="whitespace-pre-line">
                            <MathRenderer text={msg.text} />
                          </div>

                          {/* Sources citation */}
                          {msg.sources && msg.sources.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5">
                              {msg.sources.map((src, sIdx) => (
                                <span
                                  key={sIdx}
                                  className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100"
                                >
                                  Ref: {src.type} {src.number}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {msg.sender === 'student' ? 'You' : 'StudyPilot AI'}
                        </span>
                      </div>
                    ))
                  )}

                  {asking && (
                    <div className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200 w-fit text-xs text-slate-500">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                      <span>Gemini is reviewing document context...</span>
                    </div>
                  )}
                </div>

                {/* Input Form */}
                <form onSubmit={handleAskQuestion} className="flex gap-2">
                  <input
                    type="text"
                    value={questionInput}
                    onChange={(e) => setQuestionInput(e.target.value)}
                    placeholder={`Ask any doubt about ${material.fileName}...`}
                    disabled={asking}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 text-xs sm:text-sm outline-none transition-all disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={!questionInput.trim() || asking}
                    className="inline-flex items-center gap-1.5 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-all disabled:opacity-50"
                  >
                    <Send className="w-4 h-4" />
                    <span className="hidden sm:inline">Ask</span>
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentIntelligenceView;
