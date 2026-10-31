
const crypto = require('crypto');
const Quiz = require('../models/Quiz');
const QuizAttempt = require('../models/QuizAttempt');
const Subject = require('../models/Subject');
const StudyMaterial = require('../models/StudyMaterial');
const { generateQuizQuestions } = require('../services/geminiService');

const getUserId = (req) => req.user._id;

// Remove correct answers before sending quiz data to the frontend
const formatQuizForStudent = (quiz) => {
  const plainQuiz = quiz.toObject ? quiz.toObject() : quiz;

  return {
    _id: plainQuiz._id,
    subjectId: plainQuiz.subjectId,
    materialId: plainQuiz.materialId,
    title: plainQuiz.title,
    difficulty: plainQuiz.difficulty,
    questions: plainQuiz.questions.map((question) => ({
      questionId: question.questionId,
      questionText: question.questionText,
      options: question.options,
      topic: question.topic,
    })),
    createdAt: plainQuiz.createdAt,
    updatedAt: plainQuiz.updatedAt,
  };
};

// @desc    Generate a quiz from uploaded study material
// @route   POST /api/quizzes/generate
// @access  Private
const generateQuiz = async (req, res, next) => {
  try {
    const { subjectId, materialId, questionCount, difficulty } = req.body;

    // Validate required fields
    if (!subjectId || !materialId || questionCount === undefined || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Subject ID, material ID, question count, and difficulty are required.',
      });
    }

    const count = Number(questionCount);

    if (!Number.isInteger(count) || count < 1 || count > 30) {
      return res.status(400).json({
        success: false,
        message: 'Question count must be a whole number between 1 and 30.',
      });
    }

    const normalizedDifficulty = String(difficulty).toLowerCase();

    if (!['easy', 'medium', 'hard'].includes(normalizedDifficulty)) {
      return res.status(400).json({
        success: false,
        message: 'Difficulty must be easy, medium, or hard.',
      });
    }

    // Verify subject ownership
    const subject = await Subject.findOne({
      _id: subjectId,
      userId: getUserId(req),
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found or you do not have permission to access it.',
      });
    }

    // Verify material ownership and subject association
    const material = await StudyMaterial.findOne({
      _id: materialId,
      subjectId: subject._id,
      userId: getUserId(req),
    });

    if (!material) {
      return res.status(404).json({
        success: false,
        message: 'Study material not found or it does not belong to this subject.',
      });
    }

    if (material.processingStatus !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Study material processing must be completed before generating a quiz.',
      });
    }

    // Generate questions using the existing Gemini service
    const generatedQuestions = await generateQuizQuestions(
      material.extractedContent,
      {
        fileName: material.fileName,
        questionCount: count,
        difficulty: normalizedDifficulty,
      }
    );

    // Assign unique IDs to questions before saving
    const questions = generatedQuestions.map((question) => ({
      questionId: crypto.randomUUID(),
      questionText: question.questionText,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanation: question.explanation,
      topic: question.topic,
    }));

    // Save quiz in MongoDB
    const quiz = await Quiz.create({
      userId: getUserId(req),
      subjectId: subject._id,
      materialId: material._id,
      title: `${material.fileName} - ${normalizedDifficulty.charAt(0).toUpperCase() + normalizedDifficulty.slice(1)} Quiz`,
      difficulty: normalizedDifficulty,
      questions,
    });

    return res.status(201).json({
      success: true,
      message: 'Quiz generated successfully.',
      data: formatQuizForStudent(quiz),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single quiz without revealing correct answers
// @route   GET /api/quizzes/:id
// @access  Private
const getQuizById = async (req, res, next) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: getUserId(req),
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found or you do not have permission to access it.',
      });
    }

    return res.status(200).json({
      success: true,
      data: formatQuizForStudent(quiz),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all quizzes belonging to a subject
// @route   GET /api/quizzes/subject/:subjectId
// @access  Private
const getQuizzesBySubject = async (req, res, next) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.subjectId,
      userId: getUserId(req),
    });

    if (!subject) {
      return res.status(404).json({
        success: false,
        message: 'Subject not found or you do not have permission to access it.',
      });
    }

    const quizzes = await Quiz.find({
      subjectId: subject._id,
      userId: getUserId(req),
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: quizzes.length,
      data: quizzes.map(formatQuizForStudent),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit quiz answers and save an attempt
// @route   POST /api/quizzes/:id/submit
// @access  Private
const submitQuiz = async (req, res, next) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({
        success: false,
        message: 'Answers must be provided as an array.',
      });
    }

    const quiz = await Quiz.findOne({
      _id: req.params.id,
      userId: getUserId(req),
    });

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: 'Quiz not found or you do not have permission to access it.',
      });
    }

    if (answers.length !== quiz.questions.length) {
      return res.status(400).json({
        success: false,
        message: 'Please answer every question before submitting the quiz.',
      });
    }

    const questionMap = new Map(
      quiz.questions.map((question) => [
        question.questionId,
        question,
      ])
    );

    const submittedQuestionIds = new Set();

    for (const answer of answers) {
      if (
        !answer ||
        typeof answer.questionId !== 'string' ||
        typeof answer.selectedAnswer !== 'string' ||
        !answer.selectedAnswer.trim()
      ) {
        return res.status(400).json({
          success: false,
          message: 'Every answer must contain a valid question ID and selected answer.',
        });
      }

      if (submittedQuestionIds.has(answer.questionId)) {
        return res.status(400).json({
          success: false,
          message: 'Duplicate question answers are not allowed.',
        });
      }

      submittedQuestionIds.add(answer.questionId);

      const question = questionMap.get(answer.questionId);

      if (!question) {
        return res.status(400).json({
          success: false,
          message: 'An invalid question ID was submitted.',
        });
      }

      const isValidOption = question.options.some(
        (option) => option === answer.selectedAnswer.trim()
      );

      if (!isValidOption) {
        return res.status(400).json({
          success: false,
          message: 'A selected answer does not match the available options.',
        });
      }
    }

    // Save submitted answers without calculating or revealing the score
    const attempt = await QuizAttempt.create({
      userId: getUserId(req),
      quizId: quiz._id,
      subjectId: quiz.subjectId,
      answers: answers.map((answer) => ({
        questionId: answer.questionId,
        selectedAnswer: answer.selectedAnswer.trim(),
      })),
      status: 'submitted',
      submittedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: 'Quiz submitted successfully.',
      data: {
        attemptId: attempt._id,
        quizId: attempt.quizId,
        status: attempt.status,
        submittedAt: attempt.submittedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateQuiz,
  getQuizById,
  getQuizzesBySubject,
  submitQuiz,
};
