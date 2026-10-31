// Lightweight metadata classification heuristics for academic files
// Fast, inexpensive, regex & string-based (no heavy PDF extraction or LLM tokens needed)

const KNOWN_SUBJECTS = [
  { acronym: 'EMT', name: 'Electromagnetic Field Theory', regex: /\b(emft|emt|electromagnetics?|electromagnetic\s+field\s+theory)\b/i },
  { acronym: 'EMFT', name: 'Electromagnetic Field Theory', regex: /\b(emft)\b/i },
  { acronym: 'DBMS', name: 'Database Management Systems', regex: /\b(dbms|database\s+management\s+systems?|sql)\b/i },
  { acronym: 'OS', name: 'Operating Systems', regex: /\b(os|operating\s+systems?)\b/i },
  { acronym: 'DSA', name: 'Data Structures & Algorithms', regex: /\b(dsa|data\s+structures?(?:\s+and\s+algorithms)?|algorithms?)\b/i },
  { acronym: 'CN', name: 'Computer Networks', regex: /\b(cn|computer\s+networks?)\b/i },
  { acronym: 'DE', name: 'Digital Electronics', regex: /\b(digital\s+electronics|digital\s+logic(?:\s+design)?|dld|stld)\b/i },
  { acronym: 'NT', name: 'Network Theory', regex: /\b(network\s+theory|network\s+analysis|circuits?(?:\s+and\s+systems)?)\b/i },
  { acronym: 'MATHS', name: 'Engineering Mathematics', regex: /\b(maths?|mathematics|engg\s+maths?|calculus|linear\s+algebra|discrete\s+mathematics|probability)\b/i },
  { acronym: 'PHY', name: 'Engineering Physics', regex: /\b(physics|engg\s+physics|applied\s+physics|quantum)\b/i },
  { acronym: 'CHEM', name: 'Engineering Chemistry', regex: /\b(chemistry|applied\s+chemistry)\b/i },
  { acronym: 'SS', name: 'Signals & Systems', regex: /\b(signals?\s*(?:&|and)\s*systems?)\b/i },
  { acronym: 'CS', name: 'Control Systems', regex: /\b(control\s+systems?)\b/i },
  { acronym: 'MPMC', name: 'Microprocessors & Microcontrollers', regex: /\b(microprocessors?|microcontrollers?|8085|8086|mpmc)\b/i },
  { acronym: 'AI', name: 'Artificial Intelligence & ML', regex: /\b(artificial\s+intelligence|machine\s+learning|deep\s+learning|ai|ml)\b/i },
  { acronym: 'OOP', name: 'Object Oriented Programming', regex: /\b(oop|oops|object\s+oriented\s+programming|java|c\+\+|python)\b/i },
  { acronym: 'SE', name: 'Software Engineering', regex: /\b(software\s+engineering|software\s+development)\b/i },
  { acronym: 'COMM', name: 'Communication Systems', regex: /\b(analog\s+comm(?:unication)?|digital\s+comm(?:unication)?|telecom)\b/i },
  { acronym: 'THERMO', name: 'Thermodynamics', regex: /\b(thermodynamics?|thermal\s+engg)\b/i },
  { acronym: 'FM', name: 'Fluid Mechanics', regex: /\b(fluid\s+mechanics?)\b/i },
];

/**
 * Classify academic resource category from filename and folder path
 * @param {string} fileName 
 * @param {string} folderPath 
 * @returns {string} One of the standardized categories
 */
function classifyCategory(fileName = '', folderPath = '') {
  const combined = `${folderPath} ${fileName}`.toLowerCase();

  // 1. Mid Semester Papers (Internal / MST / Sessional / T1 / T2)
  if (
    /mid.?sem|internal|mst|sessional|\bt1\b|\bt2\b|midterm|mid.?term|periodic.?test/i.test(combined)
  ) {
    return 'Mid Semester Papers';
  }

  // 2. End Semester Papers (Finals / External / FAT / Sem Exam)
  if (
    /end.?sem|final.?exam|external.?exam|semester.?exam|\bfat\b|end.?term/i.test(combined)
  ) {
    return 'End Semester Papers';
  }

  // 3. Previous Year Questions (PYQs)
  if (
    /pyq|previous.?year|past.?paper|question.?paper|q.?paper|question.?bank|sample.?paper/i.test(combined)
  ) {
    return 'Previous Year Questions';
  }

  // 4. Lab Manuals
  if (
    /lab.?manual|laboratory.?manual|experiment.?list|manual|\bexp.?\d\b/i.test(combined)
  ) {
    return 'Lab Manuals';
  }

  // 5. Practical Files / Reports / Viva
  if (
    /practical.?file|practical|viva|lab.?report|record.?book|observation.?notebook/i.test(combined)
  ) {
    return 'Practical Files';
  }

  // 6. Formula Sheets / Cheat Sheets / Handbooks
  if (
    /formula|cheat.?sheet|handbook|formulae|quick.?revision|cheat.?code/i.test(combined)
  ) {
    return 'Formula Sheets';
  }

  // 7. Assignments & Homework & Tutorials
  if (
    /assignment|homework|tutorial|tut.?sheet|problem.?set|\bhw.?\d\b|worksheet/i.test(combined)
  ) {
    return 'Assignments';
  }

  // 8. Book Notes / Chapter Notes
  if (
    /book.?notes|chapter.?notes|textbook.?notes/i.test(combined)
  ) {
    return 'Book Notes';
  }

  // 9. Reference Books
  if (
    /reference.?book|reference|ref.?book|ref\b/i.test(combined)
  ) {
    return 'Reference Books';
  }

  // 10. Textbooks
  if (
    /textbook|standard.?book|author|\bbook\b|edition|\bvol\b/i.test(combined)
  ) {
    return 'Textbooks';
  }

  // 11. Lecture Notes (Handwritten, slides, unit notes)
  if (
    /lecture|class.?notes|prof|lec.?\d|handwritten|unit.?\d|module.?\d|notes|presentation|slides/i.test(combined)
  ) {
    return 'Lecture Notes';
  }

  return 'Other Resources';
}

/**
 * Detect subject name or acronym from filename and folder path
 * @param {string} fileName 
 * @param {string} folderPath 
 * @returns {string} Identifiable subject name or empty string
 */
function detectSubject(fileName = '', folderPath = '') {
  const combined = `${folderPath} ${fileName}`;

  // Check known engineering subjects
  for (const s of KNOWN_SUBJECTS) {
    if (s.regex.test(combined)) {
      return s.name;
    }
  }

  // If the path contains subfolder names like /Semester 3/Microprocessors/Unit 1
  const parts = folderPath.split('/').filter(Boolean);
  for (const p of parts) {
    // Avoid generic names like 'Semester 3', 'Notes', 'Books', 'Drive'
    if (
      !/^(sem|semester|notes|books|pyq|units?|modules?|lectures?|drive|resources?|my\s+drive)$/i.test(
        p.trim()
      ) &&
      p.length > 2 &&
      p.length < 40
    ) {
      return p.trim();
    }
  }

  return '';
}

/**
 * Detect semester from filename and folder path
 * @param {string} fileName 
 * @param {string} folderPath 
 * @returns {string} E.g. 'Semester 3' or empty string
 */
function detectSemester(fileName = '', folderPath = '') {
  const combined = `${folderPath} ${fileName}`;

  // Pattern: 'Semester 3', 'Sem-4', '3rd Sem', 'Sem 5'
  const match1 = combined.match(/(?:sem(?:ester)?|term)\s*[-_]?\s*([1-8])/i);
  if (match1) {
    return `Semester ${match1[1]}`;
  }

  const match2 = combined.match(/([1-8])(?:st|nd|rd|th)?\s*[-_]?\s*(?:sem(?:ester)?)/i);
  if (match2) {
    return `Semester ${match2[1]}`;
  }

  return '';
}

/**
 * Perform complete lightweight metadata enrichment
 */
function classifyResource({ fileName = '', folderPath = '', mimeType = '' }) {
  return {
    resourceType: classifyCategory(fileName, folderPath),
    subject: detectSubject(fileName, folderPath),
    semester: detectSemester(fileName, folderPath),
  };
}

module.exports = {
  classifyCategory,
  detectSubject,
  detectSemester,
  classifyResource,
};
