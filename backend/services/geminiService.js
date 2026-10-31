const { GoogleGenAI } = require('@google/genai');

const getApiKey = () => {
  return process.env.GEMINI_API_KEY;
};

// Official Gemini model fallback chain in priority order
const MODEL_FALLBACK_CHAIN = ['gemini-flash-lite-latest', 'gemini-3.5-flash-lite', 'gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-flash-latest'];

// Resolves and sanitizes model name
const resolveModelName = (model) => {
  const candidate = String(model || process.env.GEMINI_MODEL || 'gemini-flash-lite-latest').trim();
  if (!candidate || !candidate.startsWith('gemini-')) {
    return 'gemini-flash-lite-latest';
  }
  return candidate;
};

// Default reliable model
const DEFAULT_MODEL = resolveModelName(process.env.GEMINI_MODEL);

// Convert pages/slides extractedContent into structured text context
const formatDocumentContext = (extractedContent) => {
  if (!extractedContent) return '';

  let context = '';

  if (Array.isArray(extractedContent.pages) && extractedContent.pages.length > 0) {
    context = extractedContent.pages
      .map((p) => `--- PAGE ${p.pageNumber} ---\n${p.text || '[No text content on this page]'}`)
      .join('\n\n');
  } else if (Array.isArray(extractedContent.slides) && extractedContent.slides.length > 0) {
    context = extractedContent.slides
      .map((s) => `--- SLIDE ${s.slideNumber} ---\n${s.text || '[No text content on this slide]'}`)
      .join('\n\n');
  } else if (typeof extractedContent === 'string') {
    context = extractedContent;
  }

  // Controlled chunking safeguard (limit to ~120,000 characters to prevent token overflow)
  const MAX_CHARS = 120000;
  if (context.length > MAX_CHARS) {
    context = context.substring(0, MAX_CHARS) + '\n\n[Content truncated for analysis performance limit]';
  }

  return context.trim();
};

// Helper to call Gemini with retry and automatic fallback across valid models
const callGeminiWithRetry = async (ai, options, maxRetries = 2) => {
  const initialModel = resolveModelName(options.model || DEFAULT_MODEL);
  const modelsToTry = [
    initialModel,
    ...MODEL_FALLBACK_CHAIN.filter((m) => m !== initialModel),
  ];

  let lastError = null;

  for (let modelIndex = 0; modelIndex < modelsToTry.length; modelIndex++) {
    const currentModel = modelsToTry[modelIndex];
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        const response = await ai.models.generateContent({
          ...options,
          model: currentModel,
        });

        if (response && (response.text !== undefined || response.candidates)) {
          return response;
        }
        throw new Error('Empty response received from Gemini API');
      } catch (err) {
        lastError = err;
        attempt++;

        const isNotFound =
          err.message?.includes('404') ||
          err.message?.includes('NOT_FOUND') ||
          err.message?.includes('no longer available');
        const isQuota =
          err.message?.includes('429') ||
          err.message?.includes('RESOURCE_EXHAUSTED') ||
          err.message?.includes('quota');
        const isUnavailable =
          err.message?.includes('503') ||
          err.message?.includes('UNAVAILABLE') ||
          err.message?.includes('high demand');

        // Immediately try next model if 404, quota exhausted, or 503 service unavailable
        if ((isNotFound || isQuota || isUnavailable) && modelIndex < modelsToTry.length - 1) {
          const nextModel = modelsToTry[modelIndex + 1];
          console.warn(
            `[Gemini Service] Model "${currentModel}" failed (${err.message?.slice(0, 80)}). Seamlessly switching to "${nextModel}"...`
          );
          break; // Break inner loop, move to next model in for loop
        }

        if (attempt <= maxRetries) {
          const delay = attempt * 1000;
          console.warn(
            `[Gemini Service] Retrying "${currentModel}" attempt ${attempt}/${maxRetries} in ${delay}ms...`
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }
      }
    }
  }

  throw lastError || new Error('Gemini API call failed across all retries and fallback models.');
};

// Safe JSON parser for AI outputs
const parseAiJsonResponse = (rawText) => {
  if (!rawText) return null;
  let cleaned = rawText.trim();

  // Strip Markdown JSON code blocks if present
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/i, '').replace(/```\s*$/, '');
  }

  cleaned = cleaned.trim();
  return JSON.parse(cleaned);
};

// Generate complete structured document analysis
const generateDocumentAnalysis = async (extractedContent, documentMetadata = {}) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from environment variables.');
  }

  const documentContext = formatDocumentContext(extractedContent);

  if (!documentContext || documentContext.length < 15) {
    throw new Error(
      'Document text is empty or requires OCR. Unable to generate AI analysis on empty content.'
    );
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are StudyPilot AI, an elite academic intelligence system. Your role is to transform raw academic lecture slides or textbook materials into clean, structured learning resources for students.

Analyze the following academic document thoroughly:
Document Name: "${documentMetadata.fileName || 'Academic Material'}"
Total Sections: ${documentMetadata.pageOrSlideCount || 'Multiple'}

DOCUMENT CONTENT:
"""
${documentContext}
"""

TASK:
Produce a comprehensive academic analysis. You must output ONLY valid, parseable JSON conforming strictly to this JSON structure:
{
  "summary": "High-level 2-3 paragraph overview of the complete document, core themes, and primary learning objectives.",
  "chapters": [
    {
      "chapterTitle": "Descriptive title of chapter or major module",
      "chapterSummary": "Clear student-friendly explanation of what this chapter covers",
      "importantSubtopics": ["Subtopic 1", "Subtopic 2"],
      "simpleExplanations": [
        {
          "subtopic": "Name of subtopic",
          "explanation": "Crystal-clear conceptual explanation with analogy or breakdown"
        }
      ],
      "keyTakeaways": ["Key bullet takeaway 1", "Key bullet takeaway 2"]
    }
  ],
  "importantConcepts": [
    {
      "conceptName": "Concept Term",
      "definition": "Formal or precise academic definition",
      "relatedTopic": "Topic name",
      "relevantChapter": "Chapter title",
      "explanation": "Intuitive explanation of how and why it works"
    }
  ],
  "formulas": [
    {
      "formulaName": "Name of formula or theorem",
      "expression": "Mathematical or algorithmic expression (e.g. E = mc^2 or Big-O)",
      "explanationOfVariables": "Explanation of terms/variables",
      "relatedTopic": "Topic name",
      "relevantChapter": "Chapter title"
    }
  ],
  "importantQuestions": [
    {
      "questionText": "Question prompt",
      "questionType": "conceptual | short-answer | descriptive | numerical",
      "relatedChapter": "Chapter title",
      "relatedTopic": "Topic name",
      "difficulty": "easy | medium | hard",
      "sourceClassification": "source_extracted | ai_generated",
      "suggestedAnswer": "Comprehensive model answer for student revision"
    }
  ],
  "topics": [
    {
      "chapterName": "Chapter title",
      "topics": ["Topic 1", "Topic 2"],
      "subtopics": ["Subtopic 1a", "Subtopic 1b"]
    }
  ]
}

CRITICAL RULES:
1. FORMULA RULE: Only extract formulas that are genuinely present in the source text. If no mathematical or scientific formulas exist in this document, return an empty array [] for "formulas". DO NOT invent formulas.
2. QUESTION RULE: Generate at least 5-8 high-yield questions covering conceptual, descriptive, and short-answer types. Clearly classify questions that appear directly in slides as "source_extracted" and original review questions as "ai_generated". Never claim these are guaranteed exam questions.
3. CONCEPTS: Identify 4 to 10 core concepts with student-friendly explanations.
4. SPEED & CONCISENESS: Keep summaries, explanations, and model answers concise, crisp, and high-yield (2-4 sentences per explanation). Avoid verbose filler to maximize generation speed.
5. Response MUST be valid JSON only. Do not add conversational intro or outro.`;

  try {
    const response = await callGeminiWithRetry(ai, {
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2, // Low temperature for high academic precision
      },
    });

    const parsed = parseAiJsonResponse(response.text);

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Gemini API did not return a valid JSON object.');
    }

    return {
      summary: parsed.summary || 'Summary generated for this document.',
      chapters: Array.isArray(parsed.chapters) ? parsed.chapters : [],
      importantConcepts: Array.isArray(parsed.importantConcepts) ? parsed.importantConcepts : [],
      formulas: Array.isArray(parsed.formulas) ? parsed.formulas : [],
      importantQuestions: Array.isArray(parsed.importantQuestions) ? parsed.importantQuestions : [],
      topics: Array.isArray(parsed.topics) ? parsed.topics : [],
      metadata: {
        documentName: documentMetadata.fileName || 'Document',
        pageOrSlideCount: documentMetadata.pageOrSlideCount || 0,
        modelUsed: DEFAULT_MODEL,
        generatedAt: new Date(),
      },
    };
  } catch (err) {
    console.error('[Gemini Analysis Error]:', err);
    throw new Error(`AI Analysis failed: ${err.message}`);
  }
};

// Document-Specific Doubt Solver ("Ask About This Document")
const answerDocumentQuestion = async (extractedContent, question, documentMetadata = {}) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from environment variables.');
  }

  const documentContext = formatDocumentContext(extractedContent);

  if (!documentContext || documentContext.length < 10) {
    throw new Error('Document content is empty or unreadable.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `You are StudyPilot AI's Document Doubt Solver. A student is studying the academic document "${documentMetadata.fileName || 'Study Material'}" and has a specific question.

DOCUMENT CONTEXT:
"""
${documentContext}
"""

STUDENT QUESTION:
"${question}"

INSTRUCTIONS:
1. Answer the question using the provided document as your PRIMARY source of truth.
2. If the document answers the question, explain it clearly in student-friendly terms. Include citations to the page or slide numbers where relevant.
3. If the question asks about something NOT in the uploaded document, explicitly state that it is not covered in this document, and optionally provide a brief general explanation clearly labeled as external knowledge.
4. Avoid presenting unsupported assumptions as facts.
5. Return your response as a valid JSON object with this exact structure:
{
  "answer": "Clear, well-structured explanation using markdown formatting for headers/bullet points if helpful.",
  "isCoveredInDocument": true,
  "confidence": "high",
  "relevantSources": [
    {
      "type": "page",
      "number": 1,
      "snippet": "Short quote or context from the source page/slide"
    }
  ]
}`;

  try {
    const response = await callGeminiWithRetry(ai, {
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = parseAiJsonResponse(response.text);

    return {
      question,
      answer: parsed?.answer || response.text,
      isCoveredInDocument: parsed?.isCoveredInDocument ?? true,
      confidence: parsed?.confidence || 'high',
      relevantSources: Array.isArray(parsed?.relevantSources) ? parsed.relevantSources : [],
    };
  } catch (err) {
    console.error('[Gemini Doubt Solver Error]:', err);
    throw new Error(`Failed to solve question: ${err.message}`);
  }
};

// Generate MCQ quiz questions from uploaded study material
const generateQuizQuestions = async (
  extractedContent,
  { fileName, questionCount, difficulty }
) => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from environment variables.');
  }

  const documentContext = formatDocumentContext(extractedContent);

  if (!documentContext || documentContext.length < 15) {
    throw new Error('Document text is empty. Cannot generate quiz questions.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are StudyPilot AI, an academic quiz generator.

Generate exactly ${questionCount} multiple-choice questions using ONLY the supplied study material.

Document: ${fileName || 'Academic Material'}
Difficulty: ${difficulty}

Rules:
1. Generate exactly ${questionCount} questions.
2. Every question must have exactly four distinct options.
3. Only one option must be correct.
4. Questions must be relevant to the supplied material.
5. Match the requested difficulty.
6. Provide a short explanation for each correct answer.
7. Mention the topic tested by each question.
8. Do not invent facts outside the supplied material.

Return ONLY valid JSON in this structure:

{
  "questions": [
    {
      "questionText": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "Exact correct option text",
      "explanation": "Short explanation",
      "topic": "Topic name"
    }
  ]
}

STUDY MATERIAL:
"""
${documentContext}
"""
`;

  try {
    const response = await callGeminiWithRetry(ai, {
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const result = parseAiJsonResponse(response.text);

    if (!result || !Array.isArray(result.questions)) {
      throw new Error('Gemini returned an invalid quiz response.');
    }

    if (result.questions.length !== questionCount) {
      throw new Error('Gemini did not generate the requested number of questions.');
    }

    const validatedQuestions = result.questions.map((question, index) => {
      if (
        !question.questionText ||
        !Array.isArray(question.options) ||
        question.options.length !== 4 ||
        question.options.some(
          (option) => typeof option !== 'string' || !option.trim()
        ) ||
        new Set(question.options.map((option) => option.trim().toLowerCase())).size !== 4 ||
        typeof question.correctAnswer !== 'string' ||
        !question.correctAnswer.trim() ||
        typeof question.explanation !== 'string' ||
        !question.explanation.trim() ||
        typeof question.topic !== 'string' ||
        !question.topic.trim()
      ) {
        throw new Error(`Invalid question generated at position ${index + 1}.`);
      }

      const correctOption = question.options.find(
        (option) => option.trim() === question.correctAnswer.trim()
      );

      if (!correctOption) {
        throw new Error(`Correct answer does not match any option in question ${index + 1}.`);
      }

      return {
        questionText: question.questionText.trim(),
        options: question.options.map((option) => option.trim()),
        correctAnswer: correctOption.trim(),
        explanation: question.explanation.trim(),
        topic: question.topic.trim(),
      };
    });

    return validatedQuestions;
  } catch (err) {
    console.error('[Gemini Quiz Generation Error]:', err);
    throw new Error(`Quiz generation failed: ${err.message}`);
  }
};

const generateStudySchedule = async ({
  examName,
  startDate,
  examDate,
  syllabusTopics,
  dailyAvailableHours,
  weakTopics = [],
}) => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from environment variables.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const dailyLimitMinutes = Math.floor(Number(dailyAvailableHours) * 60);

  const prompt = `
You are StudyPilot AI, an intelligent academic study planner.

Create a realistic, personalized study schedule for the student.

EXAM DETAILS:
Exam: ${examName}
Preparation starts: ${startDate}
Exam date: ${examDate}
Available study time per day: ${dailyAvailableHours} hours
Maximum daily study time: ${dailyLimitMinutes} minutes

SYLLABUS TOPICS:
${JSON.stringify(syllabusTopics)}

WEAK TOPICS FROM PREVIOUS PERFORMANCE:
${JSON.stringify(weakTopics)}

RULES:
1. Schedule tasks only between the preparation start date and the day BEFORE the exam.
2. Cover every syllabus topic.
3. Give weak topics higher priority and additional revision/practice.
4. Include study, revision and practice tasks.
5. Distribute difficult topics across available days.
6. Include revision near the exam date.
7. Never exceed ${dailyLimitMinutes} total task minutes on any day.
8. Do not create empty days unless necessary.
9. Every task topic must match one of the supplied syllabus topics.
10. Task duration must be in minutes.
11. Use dates in YYYY-MM-DD format.
12. Do not schedule anything on or after the exam date.

Return ONLY valid JSON in this structure:

{
  "schedule": [
    {
      "date": "YYYY-MM-DD",
      "tasks": [
        {
          "topic": "Exact syllabus topic",
          "taskType": "study",
          "duration": 60,
          "priority": "high"
        }
      ]
    }
  ]
}

Allowed taskType values: study, revision, practice, buffer.
Allowed priority values: low, medium, high.
`;

  try {
    const response = await callGeminiWithRetry(ai, {
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const result = parseAiJsonResponse(response.text);

    if (!result || !Array.isArray(result.schedule) || !result.schedule.length) {
      throw new Error('Gemini returned an invalid study schedule.');
    }

    const topicSet = new Set(
      syllabusTopics.map((topic) => topic.trim().toLowerCase())
    );

    const allowedTaskTypes = ['study', 'revision', 'practice', 'buffer'];
    const allowedPriorities = ['low', 'medium', 'high'];

    const schedule = result.schedule.map((day) => {
      if (
        !day.date ||
        !/^\d{4}-\d{2}-\d{2}$/.test(day.date) ||
        day.date < startDate ||
        day.date >= examDate ||
        !Array.isArray(day.tasks) ||
        day.tasks.length === 0
      ) {
        throw new Error('Gemini returned an invalid schedule date or empty day.');
      }

      const parsedDate = new Date(`${day.date}T00:00:00.000Z`);

      if (
        Number.isNaN(parsedDate.getTime()) ||
        parsedDate.toISOString().slice(0, 10) !== day.date
      ) {
        throw new Error('Gemini returned an invalid calendar date.');
      }

      let totalMinutes = 0;

      const tasks = day.tasks.map((task) => {
        const topic = typeof task.topic === 'string' ? task.topic.trim() : '';
        const duration = Number(task.duration);

        if (!topicSet.has(topic.toLowerCase())) {
          throw new Error(`Invalid syllabus topic in generated schedule: ${topic}`);
        }

        if (
          !Number.isInteger(duration) ||
          duration < 1 ||
          duration > dailyLimitMinutes
        ) {
          throw new Error('Invalid task duration generated.');
        }

        if (!allowedTaskTypes.includes(task.taskType)) {
          throw new Error('Invalid task type generated.');
        }

        if (!allowedPriorities.includes(task.priority)) {
          throw new Error('Invalid task priority generated.');
        }

        totalMinutes += duration;

        return {
          topic,
          taskType: task.taskType,
          duration,
          priority: task.priority,
          completed: false,
        };
      });

      if (totalMinutes > dailyLimitMinutes) {
        throw new Error(`Daily study limit exceeded on ${day.date}.`);
      }

      return {
        date: parsedDate,
        tasks,
      };
    });

    schedule.sort((a, b) => a.date - b.date);

    const uniqueDates = new Set(
      schedule.map((day) => day.date.toISOString().slice(0, 10))
    );

    if (uniqueDates.size !== schedule.length) {
      throw new Error('Gemini generated duplicate schedule dates.');
    }

    return schedule;
  } catch (error) {
    console.error('[Gemini Study Schedule Error]:', error);
    throw new Error(`Study schedule generation failed: ${error.message}`);
  }
};

/**
 * Chunk text content into manageable slices of ~4,500 characters along line breaks with context overlap
 */
const chunkTextContent = (text, maxChunkSize = 4500, overlap = 350) => {
  if (!text || text.length <= maxChunkSize) return [text];
  const lines = text.split('\n');
  const chunks = [];
  let currentChunk = [];
  let currentLength = 0;

  for (const line of lines) {
    if (currentLength + line.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.join('\n'));
      let overlapChunk = [];
      let overlapLen = 0;
      for (let i = currentChunk.length - 1; i >= 0; i--) {
        if (overlapLen + currentChunk[i].length < overlap) {
          overlapChunk.unshift(currentChunk[i]);
          overlapLen += currentChunk[i].length + 1;
        } else {
          break;
        }
      }
      currentChunk = [...overlapChunk, line];
      currentLength = overlapLen + line.length + 1;
    } else {
      currentChunk.push(line);
      currentLength += line.length + 1;
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk.join('\n'));
  }

  return chunks;
};

/**
 * Robust JSON parser that handles valid JSON, truncated JSON arrays, and unclosed strings.
 * If Gemini stops midway due to token output limits, this recovers all complete items without crashing.
 */
const safeParseExamsJson = (rawText) => {
  if (!rawText || typeof rawText !== 'string') return [];

  let cleaned = rawText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  // 1. Direct JSON parse
  try {
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    if (Array.isArray(parsed.exams)) return parsed.exams;
    if (Array.isArray(parsed.data)) return parsed.data;
  } catch (initialErr) {
    // Continue to truncation recovery
  }

  // 2. Structured repair by seeking last valid object closing brace '}'
  const objStart = cleaned.indexOf('{');
  const arrStart = cleaned.indexOf('[');

  // If object format: { "exams": [ { ... }, { ... } ...
  if (objStart !== -1) {
    const innerArrStart = cleaned.indexOf('[', objStart);
    if (innerArrStart !== -1) {
      let search = cleaned.length;
      while (search > innerArrStart) {
        const lastClose = cleaned.lastIndexOf('}', search);
        if (lastClose === -1 || lastClose <= innerArrStart) break;

        const candidateObj = cleaned.slice(objStart, lastClose + 1) + '\n]}';
        try {
          const parsed = JSON.parse(candidateObj);
          if (Array.isArray(parsed.exams) && parsed.exams.length > 0) {
            console.warn(`[safeParseExamsJson]: Repaired truncated JSON object (recovered ${parsed.exams.length} exams).`);
            return parsed.exams;
          }
        } catch (e) {}

        const candidateArr = cleaned.slice(innerArrStart, lastClose + 1) + '\n]';
        try {
          const parsed = JSON.parse(candidateArr);
          if (Array.isArray(parsed) && parsed.length > 0) {
            console.warn(`[safeParseExamsJson]: Repaired truncated inner array (recovered ${parsed.length} exams).`);
            return parsed;
          }
        } catch (e) {}

        search = lastClose - 1;
      }
    }
  }

  // If raw array format: [ { ... }, { ... } ...
  if (arrStart !== -1) {
    let search = cleaned.length;
    while (search > arrStart) {
      const lastClose = cleaned.lastIndexOf('}', search);
      if (lastClose === -1 || lastClose <= arrStart) break;
      const candidate = cleaned.slice(arrStart, lastClose + 1) + '\n]';
      try {
        const parsed = JSON.parse(candidate);
        if (Array.isArray(parsed) && parsed.length > 0) {
          console.warn(`[safeParseExamsJson]: Repaired truncated raw array (recovered ${parsed.length} exams).`);
          return parsed;
        }
      } catch (e) {}
      search = lastClose - 1;
    }
  }

  // 3. Fallback regex extraction of all individual { ... } objects containing subjectName
  const objectRegex = /\{[^{}]*"subjectName"[^{}]*\}/g;
  const matches = cleaned.match(objectRegex);
  if (matches && matches.length > 0) {
    const recovered = [];
    for (const m of matches) {
      try {
        const obj = JSON.parse(m);
        if (obj && obj.subjectName) recovered.push(obj);
      } catch (e) {}
    }
    if (recovered.length > 0) {
      console.warn(`[safeParseExamsJson]: Recovered ${recovered.length} exams using regex object matching.`);
      return recovered;
    }
  }

  console.warn('[safeParseExamsJson]: Could not extract exams from snippet. Preview:', cleaned.slice(0, 150));
  return [];
};

/**
 * Helper to build prompt for date sheet extraction, optionally targeted by student semester and branch
 */
const buildDateSheetPrompt = (academicFilters = null) => {
  let targetDirective = '';
  if (academicFilters?.semester || academicFilters?.branch) {
    const sem = academicFilters.semester ? String(academicFilters.semester).trim() : '';
    const br = academicFilters.branch ? String(academicFilters.branch).trim() : '';
    targetDirective = `
TARGET STUDENT ACADEMIC PROFILE:
- Target Semester: "${sem || 'Any'}"
- Target Branch / Stream: "${br || 'Any'}"

PRIORITY EXTRACTION INSTRUCTIONS:
1. FOCUS specifically on extracting examination papers for Semester "${sem || 'Any'}" and Branch "${br || 'Any'}".
2. Also include general, common, or all-branch papers (mark applicability: "COMMON") applicable to this semester.
3. EXCLUDE papers belonging strictly to other semesters (e.g., if target is Semester 5, skip Semester 1, 2, 3, 4, 6, 7, 8).
4. If an exam is for the target semester but branch is ambiguous or uncertain, include it with applicability: "UNCERTAIN" and confidence: 0.75.
5. If the date sheet does not specify semesters, extract all courses matching the branch "${br}".`;
  }

  return `You are an expert university date sheet parser and academic examination analyzer.
Analyze the following official university examination date sheet document and extract all relevant examination entries into structured JSON.
${targetDirective}

CRITICAL EXTRACTION RULES:
1. Extract distinct examination session/paper entries from the date sheet.
2. Keep output concise to prevent truncation:
   - "subjectName": Clean subject/course name (e.g. "Signals and Systems"). DO NOT invent names.
   - "subjectCode": Official course/paper code (e.g. "EC301"). If missing, return "".
   - "examDate": Standardized date in "YYYY-MM-DD" format (e.g. "2026-12-10"). If year absent, infer from header or use 2026.
   - "day": Day of the week (e.g. "Thursday").
   - "startTime": Start time in 24h "HH:mm" (e.g. "09:00"). If missing, return "".
   - "endTime": End time in 24h "HH:mm" (e.g. "12:00"). If missing, return "".
   - "duration": Duration string (e.g. "3 Hours").
   - "semester": Semester number (e.g. "1", "2", "3", "4", "5", "6", "7", "8", or "Other").
   - "branch": Branch code (e.g. "CSE", "IT", "ECE", "EE", "ME", "CE", "COMMON", "ALL").
   - "examType": "THEORY", "PRACTICAL", "LAB", or "OTHER".
   - "applicability": "COMMON", "BRANCH_SPECIFIC", or "UNCERTAIN".
   - "confidence": Float between 0.0 and 1.0.
   - "sourcePage": Page number (integer).
   - "instructions": Brief remarks under 10 words.

Output format must be strictly valid JSON:
{
  "exams": [
    {
      "subjectName": "Signals and Systems",
      "subjectCode": "EC301",
      "examDate": "2026-12-10",
      "day": "Thursday",
      "startTime": "09:00",
      "endTime": "12:00",
      "duration": "3 Hours",
      "semester": "3",
      "branch": "ECE",
      "examType": "THEORY",
      "applicability": "BRANCH_SPECIFIC",
      "confidence": 0.95,
      "sourcePage": 1,
      "instructions": ""
    }
  ]
}
DO NOT include markdown or notes outside JSON. Return only the JSON object.`;
};

/**
 * Sanitizes and validates an array of raw extracted exam objects
 */
const sanitizeExtractedExams = (examsList) => {
  return examsList
    .filter((item) => item && typeof item === 'object' && item.subjectName?.trim())
    .map((item) => {
      const subjectName = String(item.subjectName || '').trim();
      const subjectCode = String(item.subjectCode || '').trim();
      const rawDate = String(item.examDate || '').trim();
      const startTime = String(item.startTime || '').trim();
      const endTime = String(item.endTime || '').trim();

      // Validate date format YYYY-MM-DD
      let examDate = rawDate;
      if (rawDate && !/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) {
        const parsedD = new Date(rawDate);
        if (!Number.isNaN(parsedD.getTime())) {
          examDate = parsedD.toISOString().slice(0, 10);
        }
      }

      const confidence = typeof item.confidence === 'number'
        ? Math.max(0, Math.min(1, item.confidence))
        : 0.9;

      const applicability = ['COMMON', 'BRANCH_SPECIFIC', 'UNCERTAIN', 'OTHER_SEMESTER'].includes(item.applicability)
        ? item.applicability
        : 'BRANCH_SPECIFIC';

      const isUncertain = confidence < 0.8 || applicability === 'UNCERTAIN' || !examDate;
      const verificationStatus = isUncertain ? 'NEEDS_REVIEW' : 'PENDING';

      return {
        subjectName,
        subjectCode,
        examDate,
        day: String(item.day || '').trim(),
        startTime,
        endTime,
        duration: String(item.duration || '').trim(),
        semester: String(item.semester || '').trim(),
        branch: String(item.branch || '').trim(),
        examType: String(item.examType || 'THEORY').toUpperCase().trim(),
        applicability,
        confidence,
        sourcePage: Number(item.sourcePage) || 1,
        instructions: String(item.instructions || '').trim(),
        verificationStatus,
        selected: true,
      };
    });
};

/**
 * Analyzes university date sheet PDF (text context or raw buffer for scanned PDFs)
 * and extracts all examination records in structured JSON, targeting the student's semester & branch.
 *
 * Implements multi-page chunking to prevent token output exhaustion on large university schedules,
 * and resilient JSON repair if a response ends prematurely.
 *
 * @param {string|object} extractedContent - Text or pages object from OfficeParser
 * @param {Buffer} [pdfBuffer] - Optional raw buffer if OCR / multimodal vision is needed
 * @param {object} [academicFilters] - Optional { semester, branch } to focus AI extraction
 * @returns {Promise<Array>} Array of parsed and validated exam objects
 */
const analyzeDateSheet = async (extractedContent, pdfBuffer = null, academicFilters = null) => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const ai = new GoogleGenAI({ apiKey });
  const prompt = buildDateSheetPrompt(academicFilters);

  const pagesWithText = Array.isArray(extractedContent?.pages)
    ? extractedContent.pages.filter((p) => p && typeof p.text === 'string' && p.text.trim().length > 10)
    : [];

  const allRawExams = [];

  try {
    const formattedText = formatDocumentContext(extractedContent);

    // Strategy A: Scanned PDF or no text extracted -> Multimodal PDF OCR vision fallback
    if (pdfBuffer && (!formattedText || formattedText.length < 100)) {
      console.log('[analyzeDateSheet]: Using multimodal PDF OCR vision fallback.');
      const contents = [
        {
          inlineData: {
            mimeType: 'application/pdf',
            data: pdfBuffer.toString('base64'),
          },
        },
        { text: prompt },
      ];

      const response = await callGeminiWithRetry(ai, {
        model: DEFAULT_MODEL,
        contents,
        config: {
          temperature: 0.1,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      });

      const rawText = response?.text || '';
      const parsedList = safeParseExamsJson(rawText);
      allRawExams.push(...parsedList);
    } else if (formattedText.length > 50000) {
      // Strategy B: Massive multi-page document (>50,000 characters)
      const textChunks = chunkTextContent(formattedText, 25000, 500);
      console.log(`[analyzeDateSheet]: Processing large date sheet text in ${textChunks.length} sections.`);

      for (let i = 0; i < textChunks.length; i++) {
        const contents = [
          {
            text: `${prompt}\n\n=== UNIVERSITY DATE SHEET SECTION ${i + 1} of ${textChunks.length} ===\n${textChunks[i]}`,
          },
        ];

        try {
          const response = await callGeminiWithRetry(ai, {
            model: DEFAULT_MODEL,
            contents,
            config: {
              temperature: 0.1,
              maxOutputTokens: 8192,
              responseMimeType: 'application/json',
            },
          });

          const rawText = response?.text || '';
          const chunkExams = safeParseExamsJson(rawText);
          allRawExams.push(...chunkExams);
        } catch (chunkErr) {
          console.warn(`[analyzeDateSheet]: Warning on text section ${i + 1}:`, chunkErr.message);
        }
      }
    } else {
      // Strategy C: Standard university date sheet (fits in Gemini context, targeted to student semester/branch)
      console.log(`[analyzeDateSheet]: Processing date sheet (${formattedText.length} chars) with targeted academic profile.`);
      const contents = [
        {
          text: `${prompt}\n\n=== UNIVERSITY DATE SHEET CONTENT ===\n${formattedText}`,
        },
      ];

      const response = await callGeminiWithRetry(ai, {
        model: DEFAULT_MODEL,
        contents,
        config: {
          temperature: 0.1,
          maxOutputTokens: 8192,
          responseMimeType: 'application/json',
        },
      });

      const rawText = response?.text || '';
      const parsedList = safeParseExamsJson(rawText);
      allRawExams.push(...parsedList);
    }

    if (allRawExams.length === 0) {
      throw new Error('No valid examination entries could be identified from the uploaded date sheet.');
    }

    const validatedExams = sanitizeExtractedExams(allRawExams);

    // Deduplicate any repeated items across page/text chunks
    const seen = new Set();
    const uniqueExams = [];
    for (const ex of validatedExams) {
      const key = `${ex.subjectName.toLowerCase()}|${ex.examDate}|${ex.startTime}|${ex.branch.toLowerCase()}`;
      if (!seen.has(key)) {
        seen.add(key);
        uniqueExams.push(ex);
      }
    }

    console.log(`[analyzeDateSheet]: Successfully extracted ${uniqueExams.length} unique exams.`);
    return uniqueExams;
  } catch (error) {
    console.error('[Gemini Date Sheet Analysis Error]:', error);
    throw new Error(`Date sheet analysis failed: ${error.message}`);
  }
};

// Generate an AI mnemonic from study material or manually entered content
const generateMnemonic = async ({
  extractedContent = null,
  topic,
  technique = 'acronym',
  additionalInstructions = '',
}) => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from environment variables.');
  }

  const allowedTechniques = [
    'acronym',
    'acrostic',
    'rhyme',
    'first-letter-association',
    'word-association',
    'memory-story',
    'formula-trick',
    'step-by-step',
  ];

  if (!allowedTechniques.includes(technique)) {
    throw new Error('Invalid mnemonic technique selected.');
  }

  const documentContext = formatDocumentContext(extractedContent);

  if (!documentContext || documentContext.length < 10) {
    throw new Error('Please provide sufficient study content to generate a mnemonic.');
  }

  if (!topic || !topic.trim()) {
    throw new Error('Please provide a topic for mnemonic generation.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are StudyPilot AI, an academic memory-assistance system.

Create an accurate and memorable mnemonic to help a college student remember the supplied academic concept.

TOPIC:
${topic.trim()}

REQUESTED TECHNIQUE:
${technique}

ADDITIONAL INSTRUCTIONS:
${additionalInstructions || 'None'}

SOURCE MATERIAL:
"""
${documentContext}
"""

RULES:
1. Use the supplied source material as the primary source of truth.
2. Do not invent facts, formulas, definitions, or relationships.
3. If the source does not contain enough information to create an accurate mnemonic, return isSufficient as false.
4. Make the mnemonic easy to remember and relevant to the actual concept.
5. Explain how each part of the mnemonic maps to the original concept.
6. For formula tricks, preserve the original formula exactly.
7. Keep the explanation student-friendly and concise.
8. Do not generate a generic mnemonic unrelated to the supplied topic.

Return ONLY valid JSON:

{
  "isSufficient": true,
  "title": "Mnemonic title",
  "topic": "${topic.trim()}",
  "technique": "${technique}",
  "mnemonic": "The actual mnemonic",
  "explanation": "How to remember and use it",
  "letterMapping": {
    "A": "Meaning represented by A",
    "B": "Meaning represented by B"
  },
  "originalConcept": "The accurate original academic concept",
  "example": "A short example of applying or recalling the concept"
}
`;

  try {
    const response = await callGeminiWithRetry(ai, {
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.4,
      },
    });

    const parsed = parseAiJsonResponse(response.text);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Gemini returned an invalid mnemonic response.');
    }

    if (parsed.isSufficient === false) {
      throw new Error('The supplied material does not contain enough information to generate an accurate mnemonic.');
    }

    if (
      !parsed.title ||
      !parsed.mnemonic ||
      !parsed.explanation ||
      !parsed.originalConcept
    ) {
      throw new Error('Gemini returned incomplete mnemonic content.');
    }

    return {
      title: String(parsed.title).trim(),
      topic: String(parsed.topic || topic).trim(),
      technique,
      mnemonic: String(parsed.mnemonic).trim(),
      explanation: String(parsed.explanation).trim(),
      letterMapping:
        parsed.letterMapping &&
        typeof parsed.letterMapping === 'object' &&
        !Array.isArray(parsed.letterMapping)
          ? parsed.letterMapping
          : null,
      originalConcept: String(parsed.originalConcept).trim(),
      example: String(parsed.example || '').trim(),
    };
  } catch (error) {
    console.error('[Gemini Mnemonic Generation Error]:', error);
    throw new Error(`Mnemonic generation failed: ${error.message}`);
  }
};

// Generate an academic Mermaid diagram from study material or manual content
const generateDiagram = async ({
  extractedContent = null,
  topic,
  diagramType = 'flowchart',
  additionalInstructions = '',
}) => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is missing from environment variables.');
  }

  const allowedDiagramTypes = [
    'flowchart',
    'concept-map',
    'process',
    'hierarchical',
    'block-diagram',
    'step-by-step',
  ];

  if (!allowedDiagramTypes.includes(diagramType)) {
    throw new Error('Invalid diagram type selected.');
  }

  const documentContext = formatDocumentContext(extractedContent);

  if (!documentContext || documentContext.length < 10) {
    throw new Error('Please provide sufficient study content to generate a diagram.');
  }

  if (!topic || !topic.trim()) {
    throw new Error('Please provide a topic for diagram generation.');
  }

  const ai = new GoogleGenAI({ apiKey });

  const prompt = `
You are StudyPilot AI, an academic diagram and visualization assistant.

Create a clear, accurate Mermaid diagram to help a college student understand the supplied academic topic.

TOPIC:
${topic.trim()}

REQUESTED DIAGRAM TYPE:
${diagramType}

ADDITIONAL INSTRUCTIONS:
${additionalInstructions || 'None'}

SOURCE MATERIAL:
"""
${documentContext}
"""

RULES:
1. Use the supplied source material as the primary source of truth.
2. Do not invent concepts, facts, steps, formulas, or relationships.
3. If the source does not contain enough information, return isSufficient as false.
4. Use Mermaid flowchart syntax beginning with "flowchart TD" or "graph TD".
5. Make the diagram logically structured and easy to read.
6. Use meaningful node labels and arrows to show relationships.
7. Keep labels concise and use quoted labels when they contain special characters.
8. Do not include Markdown code fences around the Mermaid source.
9. Do not use HTML, scripts, click handlers, external links, or Mermaid initialization directives.
10. Include the important steps and relationships without overcrowding the diagram.

Return ONLY valid JSON:

{
  "isSufficient": true,
  "title": "Diagram title",
  "topic": "${topic.trim()}",
  "diagramType": "${diagramType}",
  "diagramSource": "flowchart TD\\n    A[Start] --> B[Concept]",
  "explanation": "A clear explanation of the diagram and its relationships"
}
`;

  try {
    const response = await callGeminiWithRetry(ai, {
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      },
    });

    const parsed = parseAiJsonResponse(response.text);

    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('Gemini returned an invalid diagram response.');
    }

    if (parsed.isSufficient === false) {
      throw new Error('The supplied material does not contain enough information to generate an accurate diagram.');
    }

    if (
      !parsed.title ||
      !parsed.diagramSource ||
      !parsed.explanation
    ) {
      throw new Error('Gemini returned incomplete diagram content.');
    }

    const diagramSource = String(parsed.diagramSource).trim();

    if (
      !/^(flowchart|graph)\s+(TB|TD|BT|RL|LR)\b/.test(diagramSource) ||
      diagramSource.length > 20000 ||
      /<script|<\/script|javascript:|%%\s*\{|\bclick\s+[A-Za-z0-9_]+/i.test(diagramSource)
    ) {
      throw new Error('Gemini returned invalid or unsupported Mermaid diagram syntax.');
    }

    return {
      title: String(parsed.title).trim(),
      topic: String(parsed.topic || topic).trim(),
      diagramType,
      diagramSource,
      explanation: String(parsed.explanation).trim(),
    };
  } catch (error) {
    console.error('[Gemini Diagram Generation Error]:', error);
    throw new Error(`Diagram generation failed: ${error.message}`);
  }
};



module.exports = {
  generateDocumentAnalysis,
  answerDocumentQuestion,
  formatDocumentContext,
  generateQuizQuestions,
  generateStudySchedule,
  analyzeDateSheet,
  generateMnemonic,
  generateDiagram,
};

