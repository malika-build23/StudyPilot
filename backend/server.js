const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/authRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');
const materialRoutes = require('./routes/materialRoutes');
const aiRoutes = require('./routes/aiRoutes');
const quizRoutes = require('./routes/quizRoutes');
const attemptRoutes = require('./routes/attemptRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const examRoutes = require('./routes/examRoutes');
const studyPlanRoutes = require('./routes/studyPlanRoutes');
const dateSheetRoutes = require('./routes/dateSheetRoutes');
const mnemonicRoutes = require('./routes/mnemonicRoutes');
const diagramRoutes = require('./routes/diagramRoutes');
const flashcardRoutes = require('./routes/flashcardRoutes');
const revisionRoutes = require('./routes/revisionRoutes');
const cleanNoteRoutes = require('./routes/cleanNoteRoutes');

// Express Application
const app = express();

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL || 'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);

      if (
        allowedOrigins.indexOf(origin) !== -1 ||
        origin.endsWith('.vercel.app') ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }

      return callback(
        new Error('CORS policy does not allow access from the specified Origin.')
      );
    },
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically (avatars, materials, etc.)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health Check API
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'StudyPilot AI Core Backend',
    phase: 'Phase 1: Core Platform & User Management',
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/attempts', attemptRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/study-plans', studyPlanRoutes);
app.use('/api/date-sheets', dateSheetRoutes);
app.use('/api/mnemonics', mnemonicRoutes);
app.use('/api/diagrams', diagramRoutes);
app.use('/api/flashcards', flashcardRoutes);
app.use('/api/revision', revisionRoutes);
app.use('/api/clean-notes', cleanNoteRoutes);

// 404 Handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Endpoint ${req.method} ${req.originalUrl} not found on this server.`,
  });
});

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

let server;

const startServer = async () => {
  try {
    await connectDB();

    server = app.listen(PORT, () => {
      console.log(
        `[StudyPilot AI] Backend running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
      );
    });

    return server;
  } catch (err) {
    console.error('Fatal: Failed to start StudyPilot AI server:', err);
    process.exit(1);
  }
};

startServer();

module.exports = { app, startServer };