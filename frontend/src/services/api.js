import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to all outgoing requests if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('studypilot_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling common error responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If token expired or unauthorized on protected routes
    if (error.response && error.response.status === 401) {
      const isAuthRequest =
        error.config.url.includes('/auth/login') ||
        error.config.url.includes('/auth/register');
      if (!isAuthRequest) {
        localStorage.removeItem('studypilot_token');
        localStorage.removeItem('studypilot_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth Services
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  googleLogin: (credential) => api.post('/auth/google', { credential }),
  getMe: () => api.get('/auth/me'),
};

// Subject Services
export const subjectsAPI = {
  getAll: () => api.get('/subjects'),
  getById: (id) => api.get(`/subjects/${id}`),
  create: (data) => api.post('/subjects', data),
  update: (id, data) => api.put(`/subjects/${id}`, data),
  delete: (id) => api.delete(`/subjects/${id}`),
};

// Study Material Services (Part A)
export const materialsAPI = {
  upload: (formData, onUploadProgress) =>
    api.post('/materials/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),
  getBySubject: (subjectId) => api.get(`/materials/subject/${subjectId}`),
  getById: (id) => api.get(`/materials/${id}`),
  delete: (id) => api.delete(`/materials/${id}`),
};

// AI Document Intelligence Services (Part B)
export const aiAPI = {
  analyseMaterial: (materialId) => api.post(`/ai/materials/${materialId}/analyse`),
  getAnalysis: (materialId) => api.get(`/ai/materials/${materialId}/analysis`),
  askQuestion: (materialId, question) =>
    api.post(`/ai/materials/${materialId}/ask`, { question }),
};

// Quiz Generation & Attempt Services (Phase 3 - Part A)
export const quizAPI = {
  generate: (data) => api.post('/quizzes/generate', data),
  getById: (quizId) => api.get(`/quizzes/${quizId}`),
  getBySubject: (subjectId) => api.get(`/quizzes/subject/${subjectId}`),
  submit: (quizId, answers) =>
    api.post(`/quizzes/${quizId}/submit`, { answers }),
};

// Quiz Evaluation & Mistake Results (Phase 3 - Part B)
export const evaluationAPI = {
  evaluate: (attemptId) => api.post(`/attempts/${attemptId}/evaluate`),
  getResult: (attemptId) => api.get(`/attempts/${attemptId}/result`),
};

// Performance Analytics & Weak Topics (Phase 3 - Part B)
export const analyticsAPI = {
  getOverview: () => api.get('/analytics/overview'),
  getWeakTopics: () => api.get('/analytics/weak-topics'),
  getBySubject: (subjectId) => api.get(`/analytics/${subjectId}`),
};


// Exam Services (Phase 4 - Smart Exam Planner)
export const examsAPI = {
  create: (data) => api.post('/exams', data),
  getAll: () => api.get('/exams'),
  getById: (id) => api.get(`/exams/${id}`),
  update: (id, data) => api.put(`/exams/${id}`, data),
  delete: (id) => api.delete(`/exams/${id}`),

  // Smart Exam Planner endpoints
  getOverview: () => api.get('/exams/overview'),
  getUpcoming: () => api.get('/exams/upcoming'),
  getCalendar: (params) => api.get('/exams/calendar', { params }),
  getCompleted: () => api.get('/exams/completed'),

  getUniversity: () => api.get('/exams/university'),
  createUniversity: (data) => api.post('/exams/university', data),

  getPractical: () => api.get('/exams/practical'),
  createPractical: (data) => api.post('/exams/practical', data),
  updatePractical: (id, data) => api.put(`/exams/practical/${id}`, data),
  deletePractical: (id) => api.delete(`/exams/practical/${id}`),
};

// Date Sheet Services (Smart Exam Planner)
export const dateSheetsAPI = {
  upload: (formData) =>
    api.post('/date-sheets/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  getAll: () => api.get('/date-sheets'),
  getById: (id) => api.get(`/date-sheets/${id}`),
  analyze: (id) => api.post(`/date-sheets/${id}/analyze`),
  filter: (id, data) => api.post(`/date-sheets/${id}/filter`, data),
  confirm: (id, data) => api.post(`/date-sheets/${id}/confirm`, data),
};

// Study Plan Services (Phase 4 - Part A)
export const studyPlansAPI = {
  generate: (examId) => api.post('/study-plans/generate', { examId }),
  getByExam: (examId) => api.get(`/study-plans/${examId}`),
  updateTask: (planId, taskId, completed) =>
    api.patch(`/study-plans/${planId}/tasks/${taskId}`, { completed }),
  regenerate: (planId) => api.post(`/study-plans/${planId}/regenerate`),
};

// Dashboard Services
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
};

// User Profile Services
export const userAPI = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
};

// Phase 5 Part A - AI Mnemonics Generator
export const mnemonicsAPI = {
  generate: (data) => api.post('/mnemonics/generate', data),
  save: (data) => api.post('/mnemonics', data),
  getAll: (params) => api.get('/mnemonics', { params }),
  getById: (id) => api.get(`/mnemonics/${id}`),
  update: (id, data) => api.put(`/mnemonics/${id}`, data),
  delete: (id) => api.delete(`/mnemonics/${id}`),
};

// Phase 5 Part A - AI Diagram Generator
export const diagramsAPI = {
  generate: (data) => api.post('/diagrams/generate', data),
  save: (data) => api.post('/diagrams', data),
  getAll: (params) => api.get('/diagrams', { params }),
  getById: (id) => api.get(`/diagrams/${id}`),
  delete: (id) => api.delete(`/diagrams/${id}`),
};

// Phase 5 Part B - Flashcard Services
export const flashcardsAPI = {
  generate: (data) => api.post('/flashcards/generate', data),
  getDecks: (params) => api.get('/flashcards/decks', { params }),
  getDeckById: (id) => api.get(`/flashcards/decks/${id}`),
  createDeck: (data) => api.post('/flashcards/decks', data),
  deleteDeck: (id) => api.delete(`/flashcards/decks/${id}`),
  createCard: (data) => api.post('/flashcards', data),
  updateCard: (id, data) => api.put(`/flashcards/${id}`, data),
  deleteCard: (id) => api.delete(`/flashcards/${id}`),
};

// Phase 5 Part B - Spaced Repetition Services
export const revisionAPI = {
  getOverview: () => api.get('/revision/overview'),
  getToday: (params) => api.get('/revision/today', { params }),
  submitReview: (flashcardId, rating) =>
    api.post(`/revision/${flashcardId}/review`, { rating }),
  getHistory: (params) => api.get('/revision/history', { params }),
};

// Phase 5 Part B - Clean Notes Converter Services
export const cleanNotesAPI = {
  upload: (formData, onUploadProgress) =>
    api.post('/clean-notes/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    }),
  getAll: (params) => api.get('/clean-notes', { params }),
  getById: (id) => api.get(`/clean-notes/${id}`),
  update: (id, data) => api.put(`/clean-notes/${id}`, data),
  reprocess: (id) => api.post(`/clean-notes/${id}/process`),
  exportUrl: (id, format = 'html') => `/api/clean-notes/${id}/export?format=${format}`,
  delete: (id) => api.delete(`/clean-notes/${id}`),
};

export default api;

