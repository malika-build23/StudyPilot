# StudyPilot AI – Academic Companion

> **Tagline:** Your Personal AI-Powered Academic Companion  
> **Phase 1: Core Platform & User Management** (Implemented & Verified)

StudyPilot AI is a modern academic SaaS platform that helps students organize course materials, understand complex concepts, evaluate exam preparation, and plan study routines with structured intelligence.

---

## The StudyPilot Learning Method

```text
Upload ➔ Understand ➔ Learn ➔ Test ➔ Analyse ➔ Plan ➔ Succeed
```

1. **Upload:** Course syllabus, slides, and textbooks *(Phase 2)*
2. **Understand:** AI breakdowns and core concepts *(Phase 2)*
3. **Learn:** High-yield summaries and definition cards *(Phase 2)*
4. **Test:** Adaptive diagnostic quizzes and question banks *(Phase 3)*
5. **Analyse:** Topic mastery analytics and weak spot detection *(Phase 4)*
6. **Plan:** Automated exam revision schedules *(Phase 4)*
7. **Succeed:** Target grade achieved with confidence

---

## Phase 1 Implemented Features

### 1. Student Authentication & Session Management
- **Registration**: Name, email, password hashing via `bcryptjs`, password confirmation, duplicate email detection.
- **Login**: Credential verification, JWT token issuance (`7d` validity), session persistence across refreshes.
- **Security**: Protected route wrappers, automatic redirect on unauthorized access, secure error envelopes without exposing stack traces.

### 2. Academic Dashboard
- **Welcome Banner**: Dynamic greeting tailored to the student.
- **Live Metrics**: Total Subjects (live MongoDB count), Uploaded Study Materials (`0`, Phase 2 placeholder), Preparation Progress (`0%`, Phase 3/4 placeholder).
- **Upcoming Examinations**: Formatted empty state indicating upcoming Phase 4 planner.
- **Recent Activity Stream**: Live feed of recently created and updated subjects and account milestones.
- **Quick Actions**: "Create Subject" modal, "Explore Subjects", and "Upload Study Material" preview.

### 3. Subject Workspace Management
- **Full CRUD Support**: Create, View All, View Details, Edit, and Delete subjects.
- **User Data Isolation**: Strict user-level database scoping (`userId` filter on all queries and mutations) ensuring no student can access or modify another student's courses.
- **Modular Workspace Architecture**: Each subject has dedicated tabs prepared for future modules (Uploaded Study Materials, Chapter Summaries, Important Questions, Diagnostic Quizzes, Performance Analytics) with clear "Coming Soon" states.

### 4. User Profile
- View profile information (student name, email, verified status, joined date, total enrolled subjects).
- Update student name with instant synchronization across topbar, sidebar, and profile views.

---

## Technology Stack

- **Frontend**:
  - React 19 + Vite 8
  - Tailwind CSS v4 (`@tailwindcss/vite`)
  - React Router DOM v7
  - Axios (with JWT interceptors)
  - Lucide React Icons
  - Google Fonts (Inter & Plus Jakarta Sans)
- **Backend**:
  - Node.js & Express.js
  - MongoDB & Mongoose
  - JSON Web Tokens (`jsonwebtoken`)
  - Password hashing (`bcryptjs`)
  - CORS & Dotenv

---

## Project Structure

```text
codeeee/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js      # Register, login, me
│   │   ├── subjectController.js   # Subject CRUD & isolation
│   │   ├── dashboardController.js # Aggregated metrics & activity
│   │   └── userController.js      # Student profile & name updates
│   ├── middleware/
│   │   ├── auth.js                # JWT protect middleware
│   │   └── errorHandler.js        # Centralized error handler
│   ├── models/
│   │   ├── User.js                # Student schema & bcrypt methods
│   │   └── Subject.js             # Subject schema scoped to User
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── subjectRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── userRoutes.js
│   ├── test-phase1-backend.js     # Automated backend verification suite
│   ├── .env.example
│   ├── .env
│   ├── server.js                  # Express application entry
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   └── WorkflowBanner.jsx
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── Sidebar.jsx
│   │   │   └── subjects/
│   │   │       ├── SubjectModal.jsx
│   │   │       └── DeleteConfirmModal.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx    # User session & state management
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── RegisterPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── SubjectsPage.jsx
│   │   │   ├── SubjectWorkspacePage.jsx
│   │   │   ├── ProfilePage.jsx
│   │   │   └── NotFoundPage.jsx
│   │   ├── services/
│   │   │   └── api.js             # Axios client with interceptors
│   │   ├── App.jsx                # Router setup
│   │   ├── main.jsx
│   │   └── index.css              # Tailwind CSS imports & theme styles
│   ├── vite.config.js             # Vite config with backend proxy
│   └── package.json
│
├── .gitignore
└── README.md
```

---

## Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **MongoDB**: Local MongoDB instance running on `localhost:27017` or a MongoDB Atlas URI

### 2. Backend Setup
```bash
cd backend
npm install

# Verify or edit environment variables (defaults connect to local MongoDB)
# .env is already configured for local development:
# PORT=5000
# MONGODB_URI=mongodb://127.0.0.1:27017/studypilot_ai
# JWT_SECRET=studypilot_jwt_super_secret_key_phase1_2026

# Start the server
npm start
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Start development server
npm run dev
# Frontend runs on http://localhost:5173
```

### 4. Running Backend Verification Tests
```bash
cd backend
node test-phase1-backend.js
```

---

## API Reference

### Authentication
- `POST /api/auth/register` - Create a student account
- `POST /api/auth/login` - Authenticate and retrieve JWT token
- `GET /api/auth/me` - Retrieve current user from token *(Protected)*

### Subjects
- `POST /api/subjects` - Create a new subject *(Protected)*
- `GET /api/subjects` - Retrieve authenticated student's subjects *(Protected)*
- `GET /api/subjects/:id` - Retrieve individual subject details *(Protected)*
- `PUT /api/subjects/:id` - Update subject information *(Protected)*
- `DELETE /api/subjects/:id` - Delete subject workspace *(Protected)*

### Dashboard
- `GET /api/dashboard/stats` - Fetch total subjects, materials, progress, and recent activity *(Protected)*

### User Profile
- `GET /api/users/profile` - Fetch student profile with subject count *(Protected)*
- `PUT /api/users/profile` - Update student display name *(Protected)*

---

## Ready for Phase 2
Phase 1 core foundation, student security, data isolation, and UI layout are verified and ready for **Phase 2: Study Materials & Document Processing**.