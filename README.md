# StudyPilot AI – Your Personal Academic Companion

<div align="center">

<img src="./frontend/src/assets/illustrations/hero_student.png" alt="StudyPilot AI Banner" width="480" />

<br />

**Transform course notes, lecture slides, and date sheets into structured intelligence, adaptive mock exams, and visual study plans.**

[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Node.js-v18+-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?style=for-the-badge&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Gemini](https://img.shields.io/badge/Google_Gemini-2.5_Flash-4285F4?style=for-the-badge&logo=google&logoColor=white)](https://deepmind.google/technologies/gemini/)

</div>

---

## 📌 Table of Contents

- [Overview](#-overview)
- [The StudyPilot Learning Framework](#-the-studypilot-learning-framework)
- [Key Features](#-key-features)
  - [1. Gemini 2.5 Flash Document Intelligence](#1-gemini-25-flash-document-intelligence)
  - [2. Exam Planner & Unified Calendar](#2-exam-planner--unified-calendar)
  - [3. Interactive Quizzes & Timed Mock Exams](#3-interactive-quizzes--timed-mock-exams)
  - [4. AI Learning Lab (Visual Memory Studio & Diagrams)](#4-ai-learning-lab)
  - [5. Smart Resource Finder & Dark Mode](#5-smart-resource-finder)
  - [6. Clean Notes & KaTeX Math Rendering](#6-clean-notes--katex-math-rendering)
  - [7. Spaced Repetition Flashcards & Revision](#7-spaced-repetition-flashcards--revision)
- [Curated Design System](#-curated-design-system)
- [Technology Stack](#-technology-stack)
- [Repository Structure](#-repository-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Configuration](#-environment-configuration)
- [API Reference](#-api-reference)
- [License](#-license)

---

## 🚀 Overview

**StudyPilot AI** is an all-in-one AI-driven academic copilot designed to eliminate study stress and maximize conceptual retention for university and college students. 

Traditional studying suffers from scattered lecture slides, unorganized date sheets, and generic flashcards. StudyPilot AI solves this by synthesizing raw course materials (PDF slides, handouts, and date sheets) into actionable executive summaries, formula sheets, interactive diagrams, practice mock tests, and personalized study schedules.

---

## 🔄 The StudyPilot Learning Framework

```text
Upload ➔ Understand ➔ Visualize ➔ Test ➔ Analyse ➔ Plan ➔ Succeed
```

1. **Upload**: Drop lecture slides, PDFs, or university date sheets.
2. **Understand**: Gemini 2.5 Flash extracts chapter outlines, high-yield takeaways, and definitions.
3. **Visualize**: Generate mnemonics, acronyms, and Mermaid.js flowcharts for complex topics.
4. **Test**: Take adaptive quizzes and full-length timed mock tests with instant grading.
5. **Analyse**: Review diagnostic scores and isolate weak concepts.
6. **Plan**: Sync theory, lab, and viva dates into a calendar displaying full subject names.
7. **Succeed**: Master syllabus requirements with confidence.

---

## ✨ Key Features

### 1. Gemini 2.5 Flash Document Intelligence
- **Deep Document Parsing**: Ingests textbook chapters, lecture presentations, and PDF handouts.
- **Executive Summaries**: High-yield overviews with key subtopic explanations.
- **Formula & Rule Extraction**: Identifies scientific expressions and renders them in pristine KaTeX math.
- **Question Banks**: Automatically derives conceptual, definition, and analytical questions.
- **AI Doubt Solver**: Ask context-aware questions referencing specific slide numbers and document sections.

### 2. Exam Planner & Unified Calendar
- **University Theory & Practical Tracking**: Manage external university papers alongside internal lab exams, vivas, and project presentations.
- **Date Sheet AI Parser**: Extract tabular exam timetables straight from university circulars and PDFs.
- **Interactive Calendar View**: Full monthly calendar grid showing **Subject Names** instead of cryptic course codes, color-coded by exam category (Theory, Lab, Viva, Quiz).
- **Automated Daily Study Schedules**: Calculate daily target hours based on exam proximity and remaining syllabus topics.

### 3. Interactive Quizzes & Timed Mock Exams
- **Flexible Question Scope**: Generate assessments for a single document or aggregated across the entire semester.
- **Practice & Exam Modes**: Standard practice mode for casual recall or strictly timed mock exams with automatic countdowns.
- **Difficulty Tiers**: Easy, Medium, and Hard question pools.
- **Instant Diagnostic Grading**: Detailed explanations for correct and incorrect answer choices.

### 4. AI Learning Lab
- **Visual Memory Studio (Mnemonic Generator)**:
  - Turn dense lists and sequential steps into acronyms, acrostics, rhymes, and visual stories.
  - Interactive letter mapping cards (`Remember`, `Visualise`, `Understand`).
- **AI Diagram & Flowchart Generator**:
  - Convert abstract architectures and processes into clean Mermaid.js flowcharts, mind maps, and sequence diagrams.
  - High-resolution SVG and PNG export support with persistent diagram libraries.

### 5. Smart Resource Finder
- **Curated Subject Learning Materials**: Aggregates top-rated reference books, video lectures, interactive tutorials, and cheatsheets.
- **Embedded Minimise / Expand Toggle**: Keep resource searching accessible without obscuring workspace focus.
- **Self-Contained Dark Theme**: Obsidian night mode (`#181F26` surface with warm peach highlights) optimized for late-night study sessions.

### 6. Clean Notes & KaTeX Math Rendering
- **Markdown Document Editor**: Clean distraction-free note-taking with real-time formatting.
- **Robust Math Formula Engine**: Standardized KaTeX renderer that prevents syntax crashes and cleanly renders inline (`$E=mc^2$`) and block math (`$$\int_0^\infty e^{-x} dx = 1$$`).

### 7. Spaced Repetition Flashcards & Revision
- **Active Recall Decks**: Flip cards with ratings to trigger spaced repetition scheduling algorithms.
- **Daily Revision Sessions**: Targeted daily review queues to ensure long-term retention.

---

## 🎨 Curated Design System

StudyPilot AI features a bespoke **Light Premium** academic palette tailored for high legibility, reduced cognitive fatigue, and modern aesthetic elegance:

| Token | Hex Code | Purpose |
|---|---|---|
| **Deep Slate** | `#2D4354` | Primary brand buttons, active tabs, strong emphasis |
| **Soft Peach** | `#FED7A5` | Badge highlights, icon glows, active pill text |
| **Warm Terracotta** | `#9E6752` | Secondary badges, illustrations, accent cards |
| **Dusty Mauve** | `#534145` | Subtle gradients, headers, borders |
| **Muted Olive** | `#73766A` | Subtitles, helper text, neutral borders |
| **Deep Charcoal** | `#20212B` | Headings, primary readable typography |
| **Cream Surface** | `#FFF7EC` | Alert cards, highlighted active elements |
| **Light Warm Canvas** | `#FAF8F5` | Secondary canvas surfaces, inputs, cards |

---

## 💻 Technology Stack

### Frontend
- **Framework**: React 19 + Vite 8
- **Styling**: Tailwind CSS v4 (`@tailwindcss/vite`) + Vanilla CSS tokens
- **Routing**: React Router DOM v7
- **Mathematical Rendering**: KaTeX with custom error boundaries
- **Visual Diagrams**: Mermaid.js
- **Icons**: Lucide React
- **HTTP Client**: Axios with JWT authentication interceptors

### Backend
- **Runtime**: Node.js & Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: Google Gemini 2.5 Flash API (`@google/genai` / REST)
- **Security**: JWT (`jsonwebtoken`) & password hashing (`bcryptjs`)
- **File Ingestion**: Multer & PDF text extraction

---

## 📂 Repository Structure

```text
StudyPilot/
├── backend/
│   ├── config/
│   │   └── db.js                      # MongoDB connection setup
│   ├── controllers/
│   │   ├── aiController.js            # Gemini document intelligence
│   │   ├── authController.js          # Authentication & sessions
│   │   ├── cleanNoteController.js     # Clean notes storage
│   │   ├── dateSheetController.js     # University date sheet parsing
│   │   ├── diagramController.js       # Mermaid diagram generation
│   │   ├── examController.js          # Theory & practical exam CRUD
│   │   ├── flashcardController.js     # Spaced repetition flashcards
│   │   ├── materialController.js      # File uploads & PDF parsing
│   │   ├── mnemonicController.js      # Visual memory studio logic
│   │   ├── quizController.js          # Quiz generation & evaluation
│   │   ├── resourceController.js      # Smart resource finder
│   │   └── subjectController.js       # Subject workspaces
│   ├── middleware/
│   │   ├── auth.js                    # JWT route protection
│   │   └── errorHandler.js            # Central error handler
│   ├── models/
│   │   ├── DateSheet.js
│   │   ├── Diagram.js
│   │   ├── Exam.js
│   │   ├── Flashcard.js
│   │   ├── Material.js
│   │   ├── Mnemonic.js
│   │   ├── Quiz.js
│   │   ├── Subject.js
│   │   └── User.js
│   ├── routes/                        # Express API route modules
│   ├── services/
│   │   └── geminiService.js           # Gemini prompt engineering & parsing
│   ├── server.js                      # Main backend server entry
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   ├── favicon.svg
│   │   └── logo.png
│   ├── src/
│   │   ├── assets/illustrations/      # 3D academic elements
│   │   ├── components/
│   │   │   ├── ai/                    # Doc Intelligence, Mnemonics, Diagrams
│   │   │   ├── common/                # MathRenderer, ProtectedRoute
│   │   │   ├── exams/                 # CalendarView, ExamModals, StudyPlan
│   │   │   ├── layout/                # Navbar, Sidebar, AppLayout
│   │   │   ├── notes/                 # CleanNotesEditor
│   │   │   ├── quiz/                  # QuizGenerationView
│   │   │   └── resources/             # SmartResourceFinder
│   │   ├── context/                   # AuthContext
│   │   ├── pages/                     # Application views (Dashboard, Planner, etc.)
│   │   ├── services/                  # Axios API endpoints
│   │   ├── App.jsx                    # Routing table
│   │   ├── index.css                  # Design system tokens & utility classes
│   │   └── main.jsx
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## 🛠 Getting Started

### Prerequisites
- **Node.js**: v18.0 or higher
- **MongoDB**: Local MongoDB community server running on `localhost:27017` or a MongoDB Atlas connection string
- **Gemini API Key**: Valid API key from [Google AI Studio](https://aistudio.google.com/)

---

### Backend Setup

1. Open your terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your `.env` file from the template:
   ```bash
   cp .env.example .env
   ```

4. Populate your `.env` configuration:
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/studypilot_ai
   JWT_SECRET=your_super_secret_jwt_key
   GEMINI_API_KEY=your_google_gemini_api_key
   ```

5. Launch the backend server:
   ```bash
   npm run dev
   ```
   *The backend will boot on `http://localhost:5000`.*

---

### Frontend Setup

1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The client will start on `http://localhost:5173`.*

---

## 🔑 Environment Configuration

### Backend `.env` Variables

| Variable | Description | Default |
|---|---|---|
| `PORT` | Port for the Express server | `5000` |
| `MONGODB_URI` | MongoDB database connection URI | `mongodb://127.0.0.1:27017/studypilot_ai` |
| `JWT_SECRET` | Secret key for signing session tokens | `(Required)` |
| `GEMINI_API_KEY` | Google Gemini 2.5 Flash developer key | `(Required)` |

---

## 📡 API Reference

### 🔐 Authentication
- `POST /api/auth/register` - Create student account
- `POST /api/auth/login` - Authenticate student and obtain JWT
- `GET /api/auth/me` - Fetch active session student data

### 📚 Subjects & Workspaces
- `GET /api/subjects` - List all user subjects
- `POST /api/subjects` - Create a new subject
- `GET /api/subjects/:id` - Fetch subject details
- `PUT /api/subjects/:id` - Edit subject metadata
- `DELETE /api/subjects/:id` - Delete subject workspace

### 📄 Study Materials & Document Intelligence
- `POST /api/materials/upload` - Upload PDF notes / slides
- `GET /api/materials/subject/:subjectId` - List materials for subject
- `POST /api/ai/analyze-document` - Run Gemini 2.5 Flash comprehensive analysis
- `POST /api/ai/ask-document` - Ask context-grounded doubt questions

### 🗓️ Exam Planner & Calendar
- `GET /api/exams` - Fetch upcoming theory and practical assessments
- `POST /api/exams` - Schedule an individual assessment
- `POST /api/datesheet/upload` - Parse university date sheet with AI
- `GET /api/exams/calendar` - Unified monthly schedule by subject

### 🧠 AI Learning Lab & Quizzes
- `POST /api/mnemonics/generate` - Generate visual memory tricks & acronyms
- `GET /api/mnemonics` - Fetch saved mnemonics
- `POST /api/diagrams/generate` - Generate Mermaid.js diagrams & flowcharts
- `POST /api/quizzes/generate` - Synthesize practice quizzes & mock exams
- `POST /api/quizzes/submit` - Grade mock tests and return analytics

### 🔍 Smart Resources & Notes
- `GET /api/resources/:subjectId` - Retrieve curated reference guides & books
- `GET /api/clean-notes/:subjectId` - Retrieve structured clean notes

---

## 📄 License

This project is licensed under the **ISC License**. Developed for modern academic excellence.