import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import MathRenderer from '../common/MathRenderer';
import {
  TrendingUp,
  Award,
  AlertTriangle,
  Brain,
  CheckCircle2,
  Calendar,
  Sparkles,
  Loader2,
  RefreshCw,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';

const PerformanceAnalyticsView = ({ subjectId = null }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = subjectId
        ? await analyticsAPI.getBySubject(subjectId)
        : await analyticsAPI.getOverview();

      if (res.data?.success) {
        setData(res.data.data);
      } else {
        setError(res.data?.message || 'Failed to fetch performance analytics.');
      }
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError(
        err.response?.data?.message ||
        'Unable to load performance analytics. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [subjectId]);

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-12 border border-slate-200/80 text-center shadow-xs">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-3" />
        <p className="text-xs text-slate-500 font-medium">
          Aggregating quiz evaluations & computing topic mastery...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-slate-200/80 text-center shadow-xs">
        <p className="text-xs text-rose-600 font-semibold">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (!data || data.totalQuizzes === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/80 text-center shadow-xs">
        <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3">
          <Brain className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-slate-900">
          No Quiz Evaluation Data Yet
        </h4>
        <p className="text-xs text-slate-500 mt-1.5 max-w-md mx-auto leading-relaxed">
          Complete and evaluate your first diagnostic quiz to generate real-time performance analytics, mistake patterns, and weak-topic detection.
        </p>
      </div>
    );
  }

  const {
    totalQuizzes = 0,
    averageScore = 0,
    overallAccuracy = 0,
    bestPerformingSubject = null,
    scoreHistory = [],
    improvementTrend = {},
    topicStats = [],
    strongTopics = [],
    weakTopics = [],
    recommendations = [],
    subjectBreakdown = [],
  } = data;

  const isImproving = improvementTrend.trend === 'improving';
  const isDeclining = improvementTrend.trend === 'declining';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header & Live Metric KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Quizzes */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Quizzes Evaluated</span>
            <h4 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {totalQuizzes}
            </h4>
          </div>
        </div>

        {/* Overall Accuracy */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Overall Accuracy</span>
            <h4 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {overallAccuracy}%
            </h4>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Average Score</span>
            <h4 className="text-2xl font-extrabold text-slate-900 mt-0.5">
              {averageScore} <span className="text-xs font-semibold text-slate-400">pts/quiz</span>
            </h4>
          </div>
        </div>

        {/* Progress Trend */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
              isImproving
                ? 'bg-emerald-50 text-emerald-600'
                : isDeclining
                ? 'bg-rose-50 text-rose-600'
                : 'bg-slate-50 text-slate-600'
            }`}
          >
            {isImproving ? (
              <ArrowUpRight className="w-6 h-6" />
            ) : isDeclining ? (
              <ArrowDownRight className="w-6 h-6" />
            ) : (
              <TrendingUp className="w-6 h-6" />
            )}
          </div>
          <div>
            <span className="text-xs font-medium text-slate-400">Momentum Trend</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  isImproving
                    ? 'bg-emerald-100 text-emerald-700'
                    : isDeclining
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {isImproving
                  ? `+${improvementTrend.percentageChange}% Improving`
                  : isDeclining
                  ? `${improvementTrend.percentageChange}% Declining`
                  : 'Consistent'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Weak-Topic & Diagnostic Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weak Topics Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Brain className="w-4 h-4" />
              </div>
              <h4 className="text-base font-bold text-slate-900">
                Topic Mastery & Diagnostic Weak Zones
              </h4>
            </div>
            <span className="text-xs text-slate-400">
              Rule-Based Evaluation Thresholds
            </span>
          </div>

          {topicStats.length === 0 ? (
            <p className="text-xs text-slate-400 py-4">No topic statistics generated yet.</p>
          ) : (
            <div className="space-y-3 pt-1">
              {topicStats.map((stat, idx) => {
                const isWeak = stat.status === 'weak';
                const isStrong = stat.status === 'strong';
                const isInsufficient = stat.status === 'insufficient_data';

                let badgeColor = 'bg-amber-100 text-amber-800 border-amber-200';
                let barColor = 'bg-amber-500';
                let statusLabel = `${stat.accuracy}% Moderate`;

                if (isWeak) {
                  badgeColor = 'bg-rose-100 text-rose-800 border-rose-200';
                  barColor = 'bg-rose-500';
                  statusLabel = `${stat.accuracy}% Needs Practice`;
                } else if (isStrong) {
                  badgeColor = 'bg-emerald-100 text-emerald-800 border-emerald-200';
                  barColor = 'bg-emerald-500';
                  statusLabel = `${stat.accuracy}% Mastered`;
                } else if (isInsufficient) {
                  badgeColor = 'bg-slate-100 text-slate-700 border-slate-200';
                  barColor = 'bg-slate-400';
                  statusLabel = `${stat.totalQuestions} Question(s) (Need 2+)`;
                }

                return (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/60 space-y-2"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{stat.topic}</span>
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${badgeColor}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                        style={{ width: `${Math.max(stat.accuracy, 8)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{stat.correctAnswers} of {stat.totalQuestions} questions correct</span>
                      <span>{stat.incorrectAnswers} mistakes • {stat.unansweredQuestions} skipped</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Actionable Recommendations & Best Subject */}
        <div className="space-y-6">
          {/* Best Subject Card */}
          {bestPerformingSubject && (
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl p-6 text-white shadow-xs space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-blue-100">
                Top Performing Course
              </span>
              <h5 className="text-xl font-extrabold">{bestPerformingSubject.subjectName}</h5>
              <p className="text-xs text-blue-100 leading-relaxed">
                Leading with <span className="font-bold text-white">{bestPerformingSubject.accuracy}% accuracy</span> across evaluated mock tests.
              </p>
            </div>
          )}

          {/* Revision Directives */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h5 className="text-sm font-bold text-slate-900">Personalized Directives</h5>
            </div>

            <ul className="text-xs text-slate-600 space-y-2.5 pl-4 list-disc leading-relaxed">
              {recommendations.map((rec, i) => (
                <li key={i}>
                  <MathRenderer text={rec} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* 3. Chronological Score History Table */}
      {scoreHistory.length > 0 && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-bold text-slate-900">Quiz Attempt History</h4>
              <p className="text-xs text-slate-500">
                Progression timeline of verified evaluations
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
              {scoreHistory.length} Attempts Logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-l-xl">Attempt</th>
                  <th className="px-4 py-3">Quiz Title</th>
                  <th className="px-4 py-3">Course / Subject</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Accuracy</th>
                  <th className="px-4 py-3 rounded-r-xl">Date Evaluated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {scoreHistory.map((item, index) => {
                  const isHigh = item.percentage >= 80;
                  const isLow = item.percentage < 60;
                  const badge = isHigh
                    ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                    : isLow
                    ? 'text-rose-700 bg-rose-50 border-rose-200'
                    : 'text-amber-700 bg-amber-50 border-amber-200';

                  return (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">
                        #{item.attemptNumber}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">
                        {item.quizTitle}
                      </td>
                      <td className="px-4 py-3 text-slate-500">
                        {item.subjectName}
                      </td>
                      <td className="px-4 py-3 font-bold">
                        {item.score}/{item.totalQuestions}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold border ${badge}`}>
                          {item.percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceAnalyticsView;
