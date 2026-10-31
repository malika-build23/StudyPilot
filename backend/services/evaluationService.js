/**
 * StudyPilot AI - Evaluation & Performance Analytics Service
 * Deterministic answer grading, mistake analysis, rule-based weak-topic detection,
 * and multi-attempt performance analytics.
 */

// Configurable Evaluation & Mastery Thresholds
const MASTERY_THRESHOLDS = {
  STRONG_MIN_ACCURACY: 80,       // >= 80% is Mastered / Strong
  MODERATE_MIN_ACCURACY: 60,     // 60% - 79% is Moderate
  MIN_ATTEMPTS_FOR_WEAK: 2,       // Minimum questions attempted in topic before declaring 'weak'
};

/**
 * Deterministically evaluates a submitted quiz attempt against the quiz answer key.
 * No LLM calls used; performs strict, objective string comparison.
 *
 * @param {Object} attempt - QuizAttempt document
 * @param {Object} quiz - Quiz document containing question texts, options, correct answers, topics, explanations
 * @returns {Object} Evaluated metrics, questionResults, topicBreakdown, weakTopics, recommendations
 */
const evaluateQuizAttempt = (attempt, quiz) => {
  if (!quiz || !Array.isArray(quiz.questions) || quiz.questions.length === 0) {
    throw new Error('Invalid quiz structure: quiz has no questions to evaluate.');
  }

  // Create an answer lookup map by questionId
  const answerMap = new Map();
  if (Array.isArray(attempt.answers)) {
    attempt.answers.forEach((ans) => {
      if (ans && ans.questionId) {
        answerMap.set(ans.questionId, ans.selectedAnswer);
      }
    });
  }

  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;

  // Question-by-question evaluation
  const questionResults = quiz.questions.map((question) => {
    const rawSelected = answerMap.get(question.questionId);
    const hasAnswer = rawSelected !== undefined && rawSelected !== null && String(rawSelected).trim() !== '';
    const selectedAnswer = hasAnswer ? String(rawSelected).trim() : null;
    const correctAnswer = String(question.correctAnswer || '').trim();

    // Deterministic case-insensitive trimmed match
    const isCorrect = hasAnswer && selectedAnswer.toLowerCase() === correctAnswer.toLowerCase();

    if (isCorrect) {
      correctCount++;
    } else if (!hasAnswer) {
      unansweredCount++;
    } else {
      incorrectCount++;
    }

    return {
      questionId: question.questionId,
      questionText: question.questionText,
      options: question.options || [],
      selectedAnswer,
      correctAnswer,
      isCorrect,
      topic: question.topic ? question.topic.trim() : 'General Concept',
      explanation: question.explanation || 'No explanation provided for this question.',
    };
  });

  const totalQuestions = quiz.questions.length;
  const score = correctCount; // 1 point per correct answer
  const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

  // Topic breakdown for this single attempt
  const topicMap = new Map();
  questionResults.forEach((q) => {
    const t = q.topic;
    if (!topicMap.has(t)) {
      topicMap.set(t, { total: 0, correct: 0 });
    }
    const stat = topicMap.get(t);
    stat.total++;
    if (q.isCorrect) stat.correct++;
  });

  const topicBreakdown = [];
  const attemptWeakTopics = [];

  topicMap.forEach((stat, topic) => {
    const accuracy = Math.round((stat.correct / stat.total) * 100);
    let status = 'moderate';

    if (accuracy >= MASTERY_THRESHOLDS.STRONG_MIN_ACCURACY) {
      status = 'strong';
    } else if (accuracy < MASTERY_THRESHOLDS.MODERATE_MIN_ACCURACY) {
      status = 'weak';
      attemptWeakTopics.push(topic);
    }

    topicBreakdown.push({
      topic,
      totalQuestions: stat.total,
      correctAnswers: stat.correct,
      accuracy,
      status,
    });
  });

  // Sort topics by lowest accuracy first
  topicBreakdown.sort((a, b) => a.accuracy - b.accuracy);

  // Generate action-oriented revision recommendations
  const recommendations = [];
  if (percentage === 100) {
    recommendations.push('Outstanding performance! Perfect score with 100% mastery across all topics.');
  } else {
    if (attemptWeakTopics.length > 0) {
      recommendations.push(
        `Focus review on key topics needing reinforcement: ${attemptWeakTopics.join(', ')}.`
      );
    }
    if (unansweredCount > 0) {
      recommendations.push(
        `You had ${unansweredCount} unanswered question(s). Review lecture slides to build confidence before the next quiz.`
      );
    }
    if (percentage >= 80) {
      recommendations.push('Great job! You achieved a solid understanding. Review mistakes to lock in total mastery.');
    } else if (percentage >= 60) {
      recommendations.push('Good foundation. Re-read the chapter summaries and formula sheets for missed concepts.');
    } else {
      recommendations.push('Consider reviewing the document intelligence breakdown and retaking a diagnostic quiz on this material.');
    }
  }

  return {
    totalQuestions,
    correctAnswers: correctCount,
    incorrectAnswers: incorrectCount,
    unansweredQuestions: unansweredCount,
    score,
    percentage,
    questionResults,
    topicBreakdown,
    weakTopics: attemptWeakTopics,
    recommendations,
  };
};

/**
 * Aggregates questions across multiple quiz evaluations to detect robust weak topics.
 * Avoids marking a topic as weak on a single mistake (requires MIN_ATTEMPTS_FOR_WEAK).
 *
 * @param {Array} evaluations - List of QuizEvaluation records
 * @returns {Object} { topicStats, weakTopics, strongTopics, recommendations }
 */
const computeMultiAttemptWeakTopics = (evaluations = []) => {
  const topicMap = new Map();

  evaluations.forEach((evaluation) => {
    if (Array.isArray(evaluation.questionResults)) {
      evaluation.questionResults.forEach((q) => {
        const topic = q.topic ? q.topic.trim() : 'General Concept';
        if (!topicMap.has(topic)) {
          topicMap.set(topic, {
            topic,
            totalQuestions: 0,
            correctAnswers: 0,
            incorrectAnswers: 0,
            unansweredQuestions: 0,
          });
        }
        const stat = topicMap.get(topic);
        stat.totalQuestions++;
        if (q.isCorrect) {
          stat.correctAnswers++;
        } else if (!q.selectedAnswer) {
          stat.unansweredQuestions++;
        } else {
          stat.incorrectAnswers++;
        }
      });
    }
  });

  const topicStats = [];
  const weakTopics = [];
  const strongTopics = [];

  topicMap.forEach((stat) => {
    const accuracy = stat.totalQuestions > 0 ? Math.round((stat.correctAnswers / stat.totalQuestions) * 100) : 0;
    let status;

    if (stat.totalQuestions < MASTERY_THRESHOLDS.MIN_ATTEMPTS_FOR_WEAK) {
      status = 'insufficient_data';
    } else if (accuracy >= MASTERY_THRESHOLDS.STRONG_MIN_ACCURACY) {
      status = 'strong';
      strongTopics.push(stat.topic);
    } else if (accuracy >= MASTERY_THRESHOLDS.MODERATE_MIN_ACCURACY) {
      status = 'moderate';
    } else {
      status = 'weak';
      weakTopics.push(stat.topic);
    }

    topicStats.push({
      topic: stat.topic,
      totalQuestions: stat.totalQuestions,
      correctAnswers: stat.correctAnswers,
      incorrectAnswers: stat.incorrectAnswers,
      unansweredQuestions: stat.unansweredQuestions,
      accuracy,
      status,
    });
  });

  // Sort topic stats: weak first, then by lowest accuracy
  topicStats.sort((a, b) => {
    if (a.status === 'weak' && b.status !== 'weak') return -1;
    if (a.status !== 'weak' && b.status === 'weak') return 1;
    return a.accuracy - b.accuracy;
  });

  // Generate actionable revision recommendations based on multi-attempt data
  const recommendations = [];
  if (weakTopics.length > 0) {
    recommendations.push(
      `Priority revision required for ${weakTopics.length} topic(s): ${weakTopics.join(', ')}.`
    );
    weakTopics.slice(0, 3).forEach((topic) => {
      const info = topicStats.find((t) => t.topic === topic);
      recommendations.push(
        `Review definitions and formulas for "${topic}" (${info?.accuracy || 0}% accuracy over ${info?.totalQuestions || 0} questions).`
      );
    });
  } else if (topicStats.length > 0) {
    recommendations.push('All evaluated topics are currently meeting mastery benchmarks (>=60% accuracy). Keep practicing!');
  } else {
    recommendations.push('Complete your first quiz to generate topic diagnostic intelligence.');
  }

  return {
    topicStats,
    weakTopics,
    strongTopics,
    recommendations,
  };
};

/**
 * Computes complete student performance analytics across all or subject-specific evaluations.
 *
 * @param {Array} evaluations - List of QuizEvaluation records populated with quiz & subject
 * @param {Array} subjects - List of all user's Subject records
 * @returns {Object} Comprehensive analytics dashboard metrics
 */
const calculatePerformanceAnalytics = (evaluations = [], subjects = []) => {
  const totalQuizzes = evaluations.length;

  if (totalQuizzes === 0) {
    return {
      totalQuizzes: 0,
      averageScore: 0,
      overallAccuracy: 0,
      bestPerformingSubject: null,
      scoreHistory: [],
      improvementTrend: {
        trend: 'neutral',
        percentageChange: 0,
        description: 'Take quizzes to start tracking performance improvements over time.',
      },
      topicStats: [],
      strongTopics: [],
      weakTopics: [],
      recommendations: ['Complete quizzes to unlock personalized learning recommendations.'],
      subjectBreakdown: [],
    };
  }

  // Calculate totals
  let totalQuestionsAnswered = 0;
  let totalCorrectAnswers = 0;
  let totalScoreSum = 0;
  let totalPercentageSum = 0;

  evaluations.forEach((evaluation) => {
    totalQuestionsAnswered += evaluation.totalQuestions || 0;
    totalCorrectAnswers += evaluation.correctAnswers || 0;
    totalScoreSum += evaluation.score || 0;
    totalPercentageSum += evaluation.percentage || 0;
  });

  const averageScore = Number((totalScoreSum / totalQuizzes).toFixed(1));
  const overallAccuracy = totalQuestionsAnswered > 0 ? Math.round((totalCorrectAnswers / totalQuestionsAnswered) * 100) : 0;

  // Build subject lookup map
  const subjectMap = new Map();
  subjects.forEach((s) => {
    subjectMap.set(String(s._id), s.subjectName);
  });

  // Calculate subject-wise performance
  const subjectPerformanceMap = new Map();
  evaluations.forEach((evaluation) => {
    const sId = String(evaluation.subjectId);
    if (!subjectPerformanceMap.has(sId)) {
      subjectPerformanceMap.set(sId, {
        subjectId: sId,
        subjectName: subjectMap.get(sId) || 'Course',
        quizzesAttempted: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        percentageSum: 0,
      });
    }
    const stat = subjectPerformanceMap.get(sId);
    stat.quizzesAttempted++;
    stat.totalQuestions += evaluation.totalQuestions;
    stat.correctAnswers += evaluation.correctAnswers;
    stat.percentageSum += evaluation.percentage;
  });

  const subjectBreakdown = [];
  let bestPerformingSubject = null;
  let highestSubjectAccuracy = -1;

  subjectPerformanceMap.forEach((stat) => {
    const avgAccuracy = Math.round(stat.percentageSum / stat.quizzesAttempted);
    const item = {
      subjectId: stat.subjectId,
      subjectName: stat.subjectName,
      quizzesAttempted: stat.quizzesAttempted,
      accuracy: avgAccuracy,
    };
    subjectBreakdown.push(item);

    if (avgAccuracy > highestSubjectAccuracy) {
      highestSubjectAccuracy = avgAccuracy;
      bestPerformingSubject = {
        subjectId: stat.subjectId,
        subjectName: stat.subjectName,
        accuracy: avgAccuracy,
      };
    }
  });

  // Chronological score history
  const sortedEvaluations = [...evaluations].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const scoreHistory = sortedEvaluations.map((evaluation, idx) => ({
    attemptNumber: idx + 1,
    evaluationId: evaluation._id,
    attemptId: evaluation.attemptId,
    quizId: evaluation.quizId,
    quizTitle: evaluation.quizId?.title || 'Academic Quiz',
    subjectId: evaluation.subjectId,
    subjectName: subjectMap.get(String(evaluation.subjectId)) || 'Course',
    score: evaluation.score,
    totalQuestions: evaluation.totalQuestions,
    percentage: evaluation.percentage,
    date: evaluation.createdAt,
  }));

  // Improvement trend calculation (compare earlier half with later half)
  let improvementTrend = {
    trend: 'neutral',
    percentageChange: 0,
    description: 'Performance is steady. Take more quizzes to evaluate progress.',
  };

  if (totalQuizzes >= 2) {
    const midpoint = Math.floor(totalQuizzes / 2);
    const earlierAttempts = sortedEvaluations.slice(0, midpoint);
    const laterAttempts = sortedEvaluations.slice(midpoint);

    const earlierAvg = earlierAttempts.reduce((acc, e) => acc + e.percentage, 0) / earlierAttempts.length;
    const laterAvg = laterAttempts.reduce((acc, e) => acc + e.percentage, 0) / laterAttempts.length;

    const diff = Math.round(laterAvg - earlierAvg);

    if (diff > 2) {
      improvementTrend = {
        trend: 'improving',
        percentageChange: diff,
        description: `Average accuracy increased by +${diff}% across recent quizzes. Great momentum!`,
      };
    } else if (diff < -2) {
      improvementTrend = {
        trend: 'declining',
        percentageChange: diff,
        description: `Recent quiz average dipped by ${diff}%. Consider reviewing identified weak topics.`,
      };
    } else {
      improvementTrend = {
        trend: 'stable',
        percentageChange: 0,
        description: 'Performance is consistent across recent attempts.',
      };
    }
  }

  // Multi-attempt topic diagnostics
  const { topicStats, weakTopics, strongTopics, recommendations } = computeMultiAttemptWeakTopics(evaluations);

  return {
    totalQuizzes,
    averageScore,
    overallAccuracy,
    bestPerformingSubject,
    scoreHistory,
    improvementTrend,
    topicStats,
    strongTopics,
    weakTopics,
    recommendations,
    subjectBreakdown,
  };
};

module.exports = {
  MASTERY_THRESHOLDS,
  evaluateQuizAttempt,
  computeMultiAttemptWeakTopics,
  calculatePerformanceAnalytics,
};
