const Flashcard = require('../models/Flashcard');
const FlashcardDeck = require('../models/FlashcardDeck');
const FlashcardReview = require('../models/FlashcardReview');
const Subject = require('../models/Subject');

const getUserId = (req) => req.user._id;

/**
 * Calculate subsequent interval and ease factor based on SM-2 algorithm
 */
const calculateNextReview = (currentReview, rating) => {
  const now = new Date();
  let easeFactor = currentReview?.easeFactor || 2.5;
  let interval = currentReview?.interval || 0; // in days
  let consecutiveCorrect = currentReview?.consecutiveCorrect || 0;
  let correctCount = currentReview?.correctCount || 0;
  let incorrectCount = currentReview?.incorrectCount || 0;
  let nextReviewAt;

  const intervalBefore = interval;

  if (rating === 'again') {
    // 10 minutes interval for 'again'
    interval = 10 / 1440; // ~0.00694 days
    nextReviewAt = new Date(now.getTime() + 10 * 60 * 1000);
    easeFactor = Math.max(1.3, easeFactor - 0.2);
    consecutiveCorrect = 0;
    incorrectCount += 1;
  } else if (rating === 'hard') {
    if (consecutiveCorrect === 0) {
      interval = 1; // 1 day
    } else {
      interval = Math.max(1, Math.round(interval * 1.2));
    }
    nextReviewAt = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
    easeFactor = Math.max(1.3, easeFactor - 0.1);
    consecutiveCorrect += 1;
    correctCount += 1;
  } else if (rating === 'easy') {
    if (consecutiveCorrect === 0) {
      interval = 3; // 3 days for initial easy
    } else if (consecutiveCorrect === 1) {
      interval = Math.max(4, Math.round(interval * easeFactor));
    } else {
      interval = Math.max(6, Math.round(interval * easeFactor * 1.3));
    }
    nextReviewAt = new Date(now.getTime() + interval * 24 * 60 * 60 * 1000);
    easeFactor = Math.min(3.5, easeFactor + 0.15);
    consecutiveCorrect += 1;
    correctCount += 1;
  }

  return {
    nextReviewAt,
    interval,
    intervalBefore,
    intervalAfter: interval,
    easeFactor: Number(easeFactor.toFixed(2)),
    consecutiveCorrect,
    correctCount,
    incorrectCount,
  };
};

/**
 * Calculate user's consecutive day study streak
 */
const calculateStreak = (reviewRecords) => {
  const reviewDates = new Set();
  for (const rec of reviewRecords) {
    if (Array.isArray(rec.reviewHistory)) {
      for (const h of rec.reviewHistory) {
        if (h.reviewedAt) {
          const dStr = new Date(h.reviewedAt).toISOString().split('T')[0];
          reviewDates.add(dStr);
        }
      }
    }
  }

  if (reviewDates.size === 0) return 0;

  const todayStr = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // If user reviewed today, streak starts from today; otherwise if reviewed yesterday, from yesterday
  let checkDate = new Date();
  if (!reviewDates.has(todayStr)) {
    if (!reviewDates.has(yesterday)) {
      return 0; // Streak broken
    }
    checkDate = new Date(Date.now() - 24 * 60 * 60 * 1000);
  }

  let streak = 0;
  while (true) {
    const dStr = checkDate.toISOString().split('T')[0];
    if (reviewDates.has(dStr)) {
      streak += 1;
      checkDate = new Date(checkDate.getTime() - 24 * 60 * 60 * 1000);
    } else {
      break;
    }
  }

  return streak;
};

// @desc    Get spaced repetition overview & KPI statistics
// @route   GET /api/revision/overview
// @access  Private
const getRevisionOverview = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    // Total flashcards across all user decks
    const totalFlashcards = await Flashcard.countDocuments({ userId });

    // All existing review records
    const reviews = await FlashcardReview.find({ userId });
    const reviewedCardIdSet = new Set(reviews.map((r) => r.flashcardId.toString()));

    // Cards never reviewed yet count towards due cards
    const unreviewedCount = Math.max(0, totalFlashcards - reviewedCardIdSet.size);

    let dueTodayFromReviews = 0;
    let overdueCount = 0;
    let upcomingCount = 0;
    let difficultCount = 0;
    let totalCompletedReviews = 0;

    for (const r of reviews) {
      totalCompletedReviews += r.reviewCount || 0;

      if (r.nextReviewAt < startOfToday) {
        overdueCount += 1;
        dueTodayFromReviews += 1;
      } else if (r.nextReviewAt <= endOfToday) {
        dueTodayFromReviews += 1;
      } else {
        upcomingCount += 1;
      }

      // Difficult: low ease factor or more errors than correct
      if (r.easeFactor < 2.0 || r.incorrectCount > r.correctCount) {
        difficultCount += 1;
      }
    }

    const totalDueToday = dueTodayFromReviews + unreviewedCount;
    const streakDays = calculateStreak(reviews);

    // Subject-wise progress
    const subjects = await Subject.find({ userId }).select('subjectName semester');
    const subjectProgress = await Promise.all(
      subjects.map(async (subj) => {
        const totalSubjCards = await Flashcard.countDocuments({ userId, subjectId: subj._id });
        const subjReviews = await FlashcardReview.find({ userId, subjectId: subj._id });
        const subjReviewedIds = new Set(subjReviews.map((r) => r.flashcardId.toString()));
        const subjUnreviewed = Math.max(0, totalSubjCards - subjReviewedIds.size);

        let subjDueCount = subjUnreviewed;
        for (const r of subjReviews) {
          if (r.nextReviewAt <= endOfToday) {
            subjDueCount += 1;
          }
        }

        return {
          subjectId: subj._id,
          subjectName: subj.subjectName,
          semester: subj.semester,
          totalCards: totalSubjCards,
          dueCards: subjDueCount,
          completedCount: subjReviews.reduce((sum, r) => sum + (r.reviewCount || 0), 0),
        };
      })
    );

    return res.status(200).json({
      success: true,
      data: {
        dueToday: totalDueToday,
        overdue: overdueCount,
        upcoming: upcomingCount,
        totalFlashcards,
        difficultCards: difficultCount,
        completedReviews: totalCompletedReviews,
        streakDays,
        subjectProgress,
      },
    });
  } catch (error) {
    console.error('[Revision Controller - Overview Error]:', error);
    next(error);
  }
};

// @desc    Get cards due for revision today
// @route   GET /api/revision/today
// @access  Private
const getCardsDueToday = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { subjectId, deckId } = req.query;
    const now = new Date();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const cardFilter = { userId };
    if (subjectId) cardFilter.subjectId = subjectId;
    if (deckId) cardFilter.deckId = deckId;

    // Fetch user flashcards matching scope
    const allCards = await Flashcard.find(cardFilter)
      .populate('deckId', 'title chapter')
      .populate('subjectId', 'subjectName');

    if (allCards.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const cardIds = allCards.map((c) => c._id);
    const existingReviews = await FlashcardReview.find({
      userId,
      flashcardId: { $in: cardIds },
    });

    const reviewMap = new Map();
    for (const rev of existingReviews) {
      reviewMap.set(rev.flashcardId.toString(), rev);
    }

    const dueCards = [];

    for (const card of allCards) {
      const review = reviewMap.get(card._id.toString());

      if (!review) {
        // Unreviewed card: due immediately
        dueCards.push({
          flashcard: card,
          reviewState: null,
          isUnreviewed: true,
          isOverdue: false,
          isDifficult: false,
          priority: 3, // medium priority
        });
      } else if (review.nextReviewAt <= endOfToday) {
        const isOverdue = review.nextReviewAt < now;
        const isDifficult = review.easeFactor < 2.0 || review.incorrectCount > review.correctCount;

        // Priority calculation: Overdue > Difficult > Normal
        let priority = 4;
        if (isOverdue && isDifficult) priority = 1;
        else if (isOverdue) priority = 2;
        else if (isDifficult) priority = 3;

        dueCards.push({
          flashcard: card,
          reviewState: review,
          isUnreviewed: false,
          isOverdue,
          isDifficult,
          priority,
        });
      }
    }

    // Sort: Priority 1 first, then oldest nextReviewAt
    dueCards.sort((a, b) => {
      if (a.priority !== b.priority) return a.priority - b.priority;
      const aTime = a.reviewState ? new Date(a.reviewState.nextReviewAt).getTime() : 0;
      const bTime = b.reviewState ? new Date(b.reviewState.nextReviewAt).getTime() : 0;
      return aTime - bTime;
    });

    return res.status(200).json({
      success: true,
      count: dueCards.length,
      data: dueCards,
    });
  } catch (error) {
    console.error('[Revision Controller - Get Due Cards Error]:', error);
    next(error);
  }
};

// @desc    Submit review response for a flashcard (Again, Hard, Easy)
// @route   POST /api/revision/:flashcardId/review
// @access  Private
const submitCardReview = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { flashcardId } = req.params;
    const { rating } = req.body;

    if (!rating || !['again', 'hard', 'easy'].includes(String(rating).toLowerCase())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid rating. Expected "again", "hard", or "easy".',
      });
    }

    const normalizedRating = String(rating).toLowerCase();

    // Verify flashcard exists and belongs to user
    const flashcard = await Flashcard.findOne({ _id: flashcardId, userId });
    if (!flashcard) {
      return res.status(404).json({
        success: false,
        message: 'Flashcard not found or does not belong to you.',
      });
    }

    // Find existing review or create baseline
    let review = await FlashcardReview.findOne({ userId, flashcardId: flashcard._id });

    const scheduling = calculateNextReview(review, normalizedRating);

    const reviewAttempt = {
      rating: normalizedRating,
      reviewedAt: new Date(),
      intervalBefore: scheduling.intervalBefore,
      intervalAfter: scheduling.intervalAfter,
    };

    if (!review) {
      review = new FlashcardReview({
        userId,
        flashcardId: flashcard._id,
        deckId: flashcard.deckId,
        subjectId: flashcard.subjectId,
        lastReviewedAt: new Date(),
        nextReviewAt: scheduling.nextReviewAt,
        interval: scheduling.interval,
        reviewCount: 1,
        correctCount: scheduling.correctCount,
        incorrectCount: scheduling.incorrectCount,
        easeFactor: scheduling.easeFactor,
        consecutiveCorrect: scheduling.consecutiveCorrect,
        reviewHistory: [reviewAttempt],
      });
    } else {
      review.lastReviewedAt = new Date();
      review.nextReviewAt = scheduling.nextReviewAt;
      review.interval = scheduling.interval;
      review.reviewCount = (review.reviewCount || 0) + 1;
      review.correctCount = scheduling.correctCount;
      review.incorrectCount = scheduling.incorrectCount;
      review.easeFactor = scheduling.easeFactor;
      review.consecutiveCorrect = scheduling.consecutiveCorrect;
      review.reviewHistory.push(reviewAttempt);
    }

    await review.save();

    return res.status(200).json({
      success: true,
      message: `Review recorded as "${normalizedRating}". Next review scheduled.`,
      data: {
        flashcardId: flashcard._id,
        rating: normalizedRating,
        nextReviewAt: review.nextReviewAt,
        interval: review.interval,
        easeFactor: review.easeFactor,
        reviewCount: review.reviewCount,
      },
    });
  } catch (error) {
    console.error('[Revision Controller - Submit Review Error]:', error);
    next(error);
  }
};

// @desc    Get user review history log
// @route   GET /api/revision/history
// @access  Private
const getReviewHistory = async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const { limit = 50 } = req.query;

    const reviews = await FlashcardReview.find({ userId })
      .populate('flashcardId', 'question answer difficulty topic')
      .populate('deckId', 'title')
      .populate('subjectId', 'subjectName')
      .sort({ lastReviewedAt: -1 })
      .limit(parseInt(limit, 10) || 50);

    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } catch (error) {
    console.error('[Revision Controller - History Error]:', error);
    next(error);
  }
};

module.exports = {
  getRevisionOverview,
  getCardsDueToday,
  submitCardReview,
  getReviewHistory,
};
