import { useState, useEffect } from 'react';
import { analyticsAPI } from '../../services/api';
import MathRenderer from '../common/MathRenderer';
import academicAnalyticsImg from '../../assets/illustrations/element_academic_analytics.png';
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
  Target,
  BarChart3,
} from 'lucide-react';

const PerformanceAnalyticsView = ({ subjectId = null }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hoveredPoint, setHoveredPoint] = useState(null);

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
      <div className="bg-white rounded-3xl p-12 border border-[#F1F0ED] text-center shadow-[0_4px_24px_-2px_rgba(45,67,84,0.06)]">
        <Loader2 className="w-8 h-8 animate-spin text-[#2D4354] mx-auto mb-3" />
        <p className="text-xs text-[#77756F] font-semibold">
          Aggregating quiz evaluations & computing topic mastery...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-red-200 text-center shadow-[0_4px_24px_-2px_rgba(45,67,84,0.06)]">
        <p className="text-xs text-[#9E6752] font-bold">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F1F0ED] text-xs font-bold text-[#20212B] transition-colors border border-slate-200"
        >
          <RefreshCw className="w-3.5 h-3.5 text-[#2D4354]" />
          <span>Retry</span>
        </button>
      </div>
    );
  }

  if (!data || data.totalQuizzes === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#F1F0ED] text-center shadow-[0_4px_24px_-2px_rgba(45,67,84,0.06)]">
        <div className="w-16 h-16 rounded-2xl bg-[#FFF7EC] text-[#9E6752] flex items-center justify-center mx-auto mb-3 border border-[#FED7A5]/60 shadow-2xs">
          <Brain className="w-8 h-8" />
        </div>
        <h4 className="text-base font-extrabold text-[#20212B]">
          No Quiz Evaluation Data Yet
        </h4>
        <p className="text-xs text-[#77756F] mt-1.5 max-w-md mx-auto leading-relaxed font-medium">
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

  // SVG Chart Dimensions & Calculations
  const chartHeight = 160;
  const chartWidth = 560;
  const paddingX = 40;
  const paddingY = 24;

  const historyPoints = scoreHistory.slice(-10); // Last 10 attempts
  const pointsCoords = historyPoints.map((item, index) => {
    const x =
      historyPoints.length > 1
        ? paddingX + (index / (historyPoints.length - 1)) * (chartWidth - paddingX * 2)
        : chartWidth / 2;
    const y =
      chartHeight -
      paddingY -
      (Math.min(Math.max(item.percentage || 0, 0), 100) / 100) *
        (chartHeight - paddingY * 2);
    return { x, y, item, index };
  });

  const polylinePoints = pointsCoords.map((p) => `${p.x},${p.y}`).join(' ');
  const areaPath =
    pointsCoords.length > 0
      ? `M ${pointsCoords[0].x},${chartHeight - paddingY} ` +
        pointsCoords.map((p) => `L ${p.x},${p.y}`).join(' ') +
        ` L ${pointsCoords[pointsCoords.length - 1].x},${chartHeight - paddingY} Z`
      : '';

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Visual Analytics Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#2D4354] via-[#534145] to-[#20212B] p-6 sm:p-8 text-white shadow-[0_16px_36px_-6px_rgba(45,67,84,0.25)] border border-white/10 hover:border-white/20 transition-all duration-300 group">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#FED7A5]/20 rounded-full blur-3xl pointer-events-none group-hover:scale-110 transition-transform duration-500" />
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-2.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/15 text-[#FED7A5] text-[11px] font-bold tracking-wider uppercase backdrop-blur-md border border-white/20 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#FED7A5]" />
              <span>Real-Time Diagnostic Mastery</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight drop-shadow-sm">
              Academic Performance & Weak Zones
            </h3>
            <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-normal">
              Deterministic scoring, syllabus recall progression curves, and rule-based weak area detection powered by actual quiz evaluations.
            </p>
          </div>
          {/* Free-Standing 3D Analytic Sphere & Charts – NO BOX, NO BORDER */}
          <div className="relative shrink-0 flex items-center justify-center">
            <img
              src={academicAnalyticsImg}
              alt="Academic Analytics 3D Illustration"
              className="w-28 h-28 sm:w-36 sm:h-36 object-contain drop-shadow-[0_16px_30px_rgba(0,0,0,0.35)] animate-float-gentle"
            />
          </div>
        </div>
      </div>

      {/* 1. Header & Live Metric KPI Tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Quizzes */}
        <div className="bg-white rounded-3xl p-5 border border-[#F1F0ED] shadow-[0_4px_20px_-2px_rgba(45,67,84,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(45,67,84,0.12)] hover:border-[#2D4354]/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF7EC] text-[#2D4354] flex items-center justify-center shrink-0 border border-[#FED7A5]/60 shadow-2xs">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#77756F]">Quizzes Evaluated</span>
            <h4 className="text-2xl font-black text-[#20212B] mt-0.5">
              {totalQuizzes}
            </h4>
          </div>
        </div>

        {/* Overall Accuracy */}
        <div className="bg-white rounded-3xl p-5 border border-[#F1F0ED] shadow-[0_4px_20px_-2px_rgba(45,67,84,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(115,118,106,0.12)] hover:border-[#73766A]/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#F1F0ED] text-[#73766A] flex items-center justify-center shrink-0 border border-slate-200 shadow-2xs">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#77756F]">Overall Accuracy</span>
            <h4 className="text-2xl font-black text-[#20212B] mt-0.5">
              {overallAccuracy}%
            </h4>
          </div>
        </div>

        {/* Average Score */}
        <div className="bg-white rounded-3xl p-5 border border-[#F1F0ED] shadow-[0_4px_20px_-2px_rgba(45,67,84,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(158,103,82,0.12)] hover:border-[#9E6752]/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FFF7EC] text-[#9E6752] flex items-center justify-center shrink-0 border border-[#FED7A5]/60 shadow-2xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-[#77756F]">Average Score</span>
            <h4 className="text-2xl font-black text-[#20212B] mt-0.5">
              {averageScore} <span className="text-xs font-bold text-[#77756F]">pts/quiz</span>
            </h4>
          </div>
        </div>

        {/* Progress Trend */}
        <div className="bg-white rounded-3xl p-5 border border-[#F1F0ED] shadow-[0_4px_20px_-2px_rgba(45,67,84,0.04)] hover:shadow-[0_12px_28px_-4px_rgba(83,65,69,0.12)] hover:border-[#534145]/30 transition-all duration-300 transform hover:-translate-y-1 flex items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border shadow-2xs ${
              isImproving
                ? 'bg-[#FFF7EC] text-[#9E6752] border-[#FED7A5]'
                : isDeclining
                ? 'bg-rose-50 text-rose-700 border-rose-200'
                : 'bg-[#FAF8F5] text-[#73766A] border-slate-200'
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
            <span className="text-xs font-bold text-[#77756F]">Momentum Trend</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                  isImproving
                    ? 'bg-[#FFF7EC] text-[#9E6752] border-[#FED7A5]'
                    : isDeclining
                    ? 'bg-rose-50 text-rose-700 border-rose-200'
                    : 'bg-[#FAF8F5] text-[#73766A] border-slate-200'
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

      {/* 1.5. Interactive Quiz Performance Trend Chart */}
      {historyPoints.length > 0 && (
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F1F0ED] shadow-[0_4px_24px_-2px_rgba(45,67,84,0.04)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2D4354] animate-pulse" />
                <h4 className="text-base font-black text-[#20212B]">
                  Quiz Accuracy Progression Curve
                </h4>
              </div>
              <p className="text-xs text-[#77756F] font-medium mt-0.5">
                Evaluated score history across your recent diagnostic attempts (Hover points for details)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-bold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 rounded-full bg-[#2D4354]" />
                <span className="text-[#77756F]">Score %</span>
              </div>
              <span className="text-[11px] font-bold text-[#2D4354] bg-[#FAF8F5] px-2.5 py-0.5 rounded-full border border-slate-200">
                Last {historyPoints.length} Attempts
              </span>
            </div>
          </div>

          <div className="relative overflow-x-auto pt-2">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="w-full h-44 overflow-visible"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGradientBrand" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2D4354" stopOpacity="0.25" />
                  <stop offset="50%" stopColor="#FED7A5" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#FAF8F5" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Grid Lines */}
              {[0, 25, 50, 75, 100].map((val) => {
                const y = chartHeight - paddingY - (val / 100) * (chartHeight - paddingY * 2);
                return (
                  <g key={val}>
                    <line
                      x1={paddingX}
                      y1={y}
                      x2={chartWidth - paddingX}
                      y2={y}
                      stroke="#F1F0ED"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={paddingX - 8}
                      y={y + 3}
                      fill="#77756F"
                      fontSize="9"
                      fontWeight="bold"
                      textAnchor="end"
                    >
                      {val}%
                    </text>
                  </g>
                );
              })}

              {/* Filled Area */}
              {areaPath && <path d={areaPath} fill="url(#chartGradientBrand)" />}

              {/* Line path */}
              {polylinePoints && (
                <polyline
                  fill="none"
                  stroke="#2D4354"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={polylinePoints}
                />
              )}

              {/* Interactive Dots */}
              {pointsCoords.map((pt) => {
                const isHovered = hoveredPoint?.index === pt.index;
                return (
                  <g key={pt.index}>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 6 : 4}
                      fill="#FFFFFF"
                      stroke="#2D4354"
                      strokeWidth={isHovered ? 3 : 2}
                      className="cursor-pointer transition-all duration-150"
                      onMouseEnter={() => setHoveredPoint(pt)}
                      onMouseLeave={() => setHoveredPoint(null)}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Floating Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute z-20 pointer-events-none p-2.5 rounded-xl bg-[#20212B] text-white shadow-xl text-xs space-y-1 transform -translate-x-1/2 -translate-y-full -mt-2 animate-in fade-in zoom-in-95 duration-100 border border-white/10"
                style={{
                  left: `${(hoveredPoint.x / chartWidth) * 100}%`,
                  top: `${(hoveredPoint.y / chartHeight) * 100}%`,
                }}
              >
                <p className="font-extrabold text-[#FED7A5] truncate max-w-[180px]">
                  {hoveredPoint.item.quizTitle}
                </p>
                <div className="flex items-center justify-between gap-3 text-[11px] text-slate-300">
                  <span>Score: {hoveredPoint.item.score}/{hoveredPoint.item.totalQuestions}</span>
                  <span className="font-bold text-[#20212B] bg-[#FED7A5] px-1.5 py-0.5 rounded">
                    {hoveredPoint.item.percentage}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. Weak-Topic & Diagnostic Highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weak Topics Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F1F0ED] shadow-[0_4px_24px_-2px_rgba(45,67,84,0.04)] space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5]/60 flex items-center justify-center font-bold shadow-2xs">
                <Brain className="w-4 h-4" />
              </div>
              <h4 className="text-base font-extrabold text-[#20212B]">
                Topic Mastery & Diagnostic Weak Zones
              </h4>
            </div>
            <span className="text-xs font-semibold text-[#77756F]">
              Rule-Based Evaluation Thresholds
            </span>
          </div>

          {topicStats.length === 0 ? (
            <p className="text-xs text-[#77756F] py-4 font-medium">No topic statistics generated yet.</p>
          ) : (
            <div className="space-y-3 pt-1">
              {topicStats.map((stat, idx) => {
                const isWeak = stat.status === 'weak';
                const isStrong = stat.status === 'strong';
                const isInsufficient = stat.status === 'insufficient_data';

                let badgeColor = 'bg-[#FFF7EC] text-[#9E6752] border-[#FED7A5]';
                let barColor = 'bg-gradient-to-r from-[#FED7A5] to-[#9E6752]';
                let statusLabel = `${stat.accuracy}% Moderate`;

                if (isWeak) {
                  badgeColor = 'bg-rose-50 text-rose-700 border-rose-200';
                  barColor = 'bg-gradient-to-r from-rose-400 to-rose-500';
                  statusLabel = `${stat.accuracy}% Needs Practice`;
                } else if (isStrong) {
                  badgeColor = 'bg-[#FAF8F5] text-[#2D4354] border-slate-300';
                  barColor = 'bg-gradient-to-r from-[#73766A] to-[#2D4354]';
                  statusLabel = `${stat.accuracy}% Mastered`;
                } else if (isInsufficient) {
                  badgeColor = 'bg-[#F1F0ED] text-[#77756F] border-slate-200';
                  barColor = 'bg-[#73766A]/40';
                  statusLabel = `${stat.totalQuestions} Question(s) (Need 2+)`;
                }

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-[#FAF8F5]/80 hover:bg-white border border-[#F1F0ED] hover:border-[#FED7A5]/80 shadow-2xs hover:shadow-xs transition-all duration-200 space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-[#20212B]">{stat.topic}</span>
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${badgeColor}`}>
                        {statusLabel}
                      </span>
                    </div>

                    <div className="w-full bg-[#F1F0ED] h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ease-out ${barColor}`}
                        style={{ width: `${Math.max(stat.accuracy, 8)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[#77756F] font-medium">
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
            <div className="bg-gradient-to-br from-[#2D4354] via-[#534145] to-[#73766A] rounded-3xl p-6 text-white shadow-md shadow-[#2D4354]/15 space-y-2 relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-10 -mt-10 w-32 h-32 rounded-full bg-[#FED7A5]/10 blur-xl pointer-events-none" />
              <span className="text-[10px] uppercase font-black tracking-wider px-2.5 py-0.5 rounded-full bg-white/20 text-[#FED7A5] backdrop-blur-md">
                Top Performing Course
              </span>
              <h5 className="text-xl font-black">{bestPerformingSubject.subjectName}</h5>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                Leading with <span className="font-black text-[#FED7A5]">{bestPerformingSubject.accuracy}% accuracy</span> across evaluated mock tests.
              </p>
            </div>
          )}

          {/* Revision Directives */}
          <div className="bg-white rounded-3xl p-6 border border-[#F1F0ED] shadow-[0_4px_24px_-2px_rgba(45,67,84,0.04)] space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#FFF7EC] text-[#9E6752] flex items-center justify-center">
                <Lightbulb className="w-4 h-4" />
              </div>
              <h5 className="text-sm font-extrabold text-[#20212B]">Personalized Directives</h5>
            </div>

            <ul className="text-xs text-[#77756F] space-y-2.5 pl-4 list-disc leading-relaxed font-medium">
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
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F1F0ED] shadow-[0_4px_24px_-2px_rgba(45,67,84,0.04)] space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-base font-black text-[#20212B]">Quiz Attempt History</h4>
              <p className="text-xs text-[#77756F] font-medium">
                Progression timeline of verified evaluations
              </p>
            </div>
            <span className="text-xs font-bold text-[#2D4354] bg-[#FAF8F5] px-3 py-1 rounded-full border border-slate-200">
              {scoreHistory.length} Attempts Logged
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF8F5] text-[#77756F] uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3 rounded-l-2xl">Attempt</th>
                  <th className="px-4 py-3">Quiz Title</th>
                  <th className="px-4 py-3">Course / Subject</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Accuracy</th>
                  <th className="px-4 py-3 rounded-r-2xl">Date Evaluated</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-[#20212B]">
                {scoreHistory.map((item, index) => {
                  const isHigh = item.percentage >= 80;
                  const isLow = item.percentage < 60;
                  const badge = isHigh
                    ? 'text-[#2D4354] bg-[#FFF7EC] border-[#FED7A5]'
                    : isLow
                    ? 'text-rose-700 bg-rose-50 border-rose-200'
                    : 'text-[#9E6752] bg-[#FAF8F5] border-slate-200';

                  return (
                    <tr key={index} className="hover:bg-[#FAF8F5]/60 transition-colors">
                      <td className="px-4 py-3 font-bold text-[#2D4354]">
                        #{item.attemptNumber}
                      </td>
                      <td className="px-4 py-3 font-semibold text-[#20212B]">
                        {item.quizTitle}
                      </td>
                      <td className="px-4 py-3 text-[#77756F] font-medium">
                        {item.subjectName}
                      </td>
                      <td className="px-4 py-3 font-extrabold text-[#20212B]">
                        {item.score}/{item.totalQuestions}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black border ${badge}`}>
                          {item.percentage}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[#77756F] font-medium">
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
