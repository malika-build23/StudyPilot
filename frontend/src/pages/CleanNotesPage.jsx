import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { cleanNotesAPI, subjectsAPI } from '../services/api';
import CleanNotesEditor from '../components/notes/CleanNotesEditor';
import CleanNotesUploadModal from '../components/notes/CleanNotesUploadModal';
import {
  FileText,
  UploadCloud,
  Search,
  BookOpen,
  Calendar,
  Trash2,
  Printer,
  Edit3,
  Loader2,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import notebookImg from '../assets/illustrations/element_open_notebook.png';

const CleanNotesPage = () => {
  const [searchParams] = useSearchParams();
  const initialSubject = searchParams.get('subject') || '';
  const noteIdParam = searchParams.get('id') || '';

  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubject);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  // Active Note Editor View
  const [activeNote, setActiveNote] = useState(null);
  const [loadingNote, setLoadingNote] = useState(false);

  // Upload Modal
  const [uploadModalOpen, setUploadModalOpen] = useState(false);

  // Fetch subjects
  useEffect(() => {
    const fetchSubjects = async () => {
      try {
        const res = await subjectsAPI.getAll();
        if (res.data?.success) {
          setSubjects(res.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load subjects:', err);
      }
    };
    fetchSubjects();
  }, []);

  // Fetch clean notes
  const fetchNotes = async () => {
    try {
      setLoading(true);
      const params = {};
      if (selectedSubjectId) params.subjectId = selectedSubjectId;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const res = await cleanNotesAPI.getAll(params);
      if (res.data?.success) {
        setNotes(res.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch clean notes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotes();
  }, [selectedSubjectId, searchQuery]);

  // Handle single note selection
  const handleSelectNote = async (id) => {
    try {
      setLoadingNote(true);
      const res = await cleanNotesAPI.getById(id);
      if (res.data?.success) {
        setActiveNote(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load clean note details:', err);
      alert('Failed to load note.');
    } finally {
      setLoadingNote(false);
    }
  };

  // Auto-open if note ID param provided
  useEffect(() => {
    if (noteIdParam && !activeNote && !loading) {
      handleSelectNote(noteIdParam);
    }
  }, [noteIdParam, loading]);

  const handleDeleteNote = async (id) => {
    if (!window.confirm('Are you sure you want to delete this clean note?')) {
      return;
    }

    try {
      await cleanNotesAPI.delete(id);
      setActiveNote(null);
      fetchNotes();
    } catch (err) {
      console.error('Failed to delete clean note:', err);
      alert('Failed to delete note.');
    }
  };

  if (loadingNote) {
    return (
      <div className="py-24 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs text-slate-500 font-medium">Opening clean notes editor...</p>
      </div>
    );
  }

  // Active Note Editor View
  if (activeNote) {
    return (
      <CleanNotesEditor
        note={activeNote}
        onBack={() => {
          setActiveNote(null);
          fetchNotes();
        }}
        onSaveSuccess={(updated) => {
          setActiveNote(updated);
          fetchNotes();
        }}
      />
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-150">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <img
            src={notebookImg}
            alt="Study Notebook"
            className="w-16 h-16 sm:w-20 sm:h-20 object-contain drop-shadow-[0_12px_24px_rgba(45,67,84,0.16)] shrink-0 animate-float-gentle"
          />
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#20212B] tracking-tight">
                Clean Notes AI
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5]">
                OCR & AI
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#77756F] mt-1 font-medium">
              Convert messy handwritten class notes into structured, searchable digital notes with formulas
            </p>
          </div>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D4354] hover:bg-[#20212B] text-white font-semibold text-xs shadow-sm hover:shadow-md transition-all hover:scale-102 self-start sm:self-auto cursor-pointer"
        >
          <UploadCloud className="w-4 h-4 text-[#FED7A5]" />
          <span>Upload Notes</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Subject pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <button
            onClick={() => setSelectedSubjectId('')}
            className={`px-4 py-2 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
              selectedSubjectId === ''
                ? 'bg-[#2D4354] text-white shadow-xs'
                : 'bg-white text-[#77756F] border border-[#F1F0ED] hover:bg-[#FAF8F5] hover:text-[#20212B]'
            }`}
          >
            All Subjects ({notes.length})
          </button>

          {subjects.map((sub) => (
            <button
              key={sub._id}
              onClick={() => setSelectedSubjectId(sub._id)}
              className={`px-4 py-2 rounded-xl font-semibold transition-all shrink-0 cursor-pointer ${
                selectedSubjectId === sub._id
                  ? 'bg-[#2D4354] text-white shadow-xs'
                  : 'bg-white text-[#77756F] border border-[#F1F0ED] hover:bg-[#FAF8F5] hover:text-[#20212B]'
              }`}
            >
              {sub.subjectName}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#77756F] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search notes or chapters..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2 rounded-xl border border-[#F1F0ED] bg-white text-xs text-[#20212B] placeholder-[#77756F] focus:outline-none focus:ring-2 focus:ring-[#2D4354]/20 focus:border-[#2D4354] transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Notes Grid */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#2D4354]" />
          <p className="text-xs text-[#77756F] font-semibold">Loading clean notes library...</p>
        </div>
      ) : notes.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 sm:p-14 border border-[#F1F0ED] text-center shadow-[0_4px_24px_-2px_rgba(45,67,84,0.04)] relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-[#FFF7EC] text-[#9E6752] flex items-center justify-center mx-auto mb-4 border border-[#FED7A5]/60 shadow-2xs">
            <FileText className="w-8 h-8" />
          </div>
          <h3 className="text-base font-bold text-[#20212B]">No Clean Notes Found</h3>
          <p className="text-xs text-[#77756F] mt-1.5 max-w-md mx-auto leading-relaxed font-medium">
            Upload photos of your handwritten notebook pages (JPG/PNG) or scanned PDFs. Gemini AI
            will transcribe and structure them with formulas, definitions, and headings.
          </p>
          <button
            onClick={() => setUploadModalOpen(true)}
            className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2D4354] hover:bg-[#20212B] text-white font-semibold text-xs shadow-sm transition-all hover:scale-102 cursor-pointer"
          >
            <UploadCloud className="w-4 h-4 text-[#FED7A5]" />
            <span>Upload Handwritten Notes</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {notes.map((noteItem, idx) => {
            const accents = [
              { border: 'border-l-[#2D4354]', badge: 'bg-[#FAF8F5] text-[#2D4354] border-[#2D4354]/20' },
              { border: 'border-l-[#9E6752]', badge: 'bg-[#FFF7EC] text-[#9E6752] border-[#FED7A5]' },
              { border: 'border-l-[#73766A]', badge: 'bg-[#F1F0ED] text-[#73766A] border-slate-300' },
              { border: 'border-l-[#534145]', badge: 'bg-[#FAF8F5] text-[#534145] border-[#534145]/20' },
            ];
            const acc = accents[idx % accents.length];

            return (
              <div
                key={noteItem._id}
                className={`bg-white rounded-3xl p-6 border border-[#F1F0ED] ${acc.border} border-l-4 shadow-[0_4px_20px_-2px_rgba(45,67,84,0.04)] hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${acc.badge}`}>
                      {noteItem.subjectId?.subjectName || 'Course'}
                    </span>

                    <span
                      className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        noteItem.processingStatus === 'completed'
                          ? 'bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5]'
                          : noteItem.processingStatus === 'processing'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200 animate-pulse'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {noteItem.processingStatus}
                    </span>
                  </div>

                  <div>
                    <h3
                      onClick={() => handleSelectNote(noteItem._id)}
                      className="font-extrabold text-[#202B42] text-base group-hover:text-[#4169E1] cursor-pointer transition-colors line-clamp-1"
                    >
                      {noteItem.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-xs text-[#77839A] mt-1">
                      <BookOpen className="w-3.5 h-3.5 text-[#9270DB]" />
                      <span>{noteItem.chapter || 'Lecture Notes'}</span>
                    </div>
                    <p className="text-xs text-[#77839A] mt-2 line-clamp-2 leading-relaxed">
                      {noteItem.extractedText
                        ? noteItem.extractedText.slice(0, 120) + '...'
                        : 'Transcribed digital notes with KaTeX equations'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-[#77839A] flex items-center gap-1 font-medium">
                    <Calendar className="w-3 h-3 text-[#77839A]" />
                    <span>{new Date(noteItem.createdAt).toLocaleDateString()}</span>
                  </span>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleSelectNote(noteItem._id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#2D4354] hover:bg-[#20212B] text-white font-semibold text-xs shadow-xs transition-all hover:scale-102 cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3 text-[#FED7A5]" />
                      <span>Open</span>
                    </button>
                    <a
                      href={cleanNotesAPI.exportUrl(noteItem._id, 'html')}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-[#77839A] hover:text-[#4169E1] hover:bg-[#F5F7FC] rounded-xl transition-colors"
                      title="Print / PDF View"
                    >
                      <Printer className="w-3.5 h-3.5" />
                    </a>
                    <button
                      onClick={() => handleDeleteNote(noteItem._id)}
                      className="p-1.5 text-[#77839A] hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                      title="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal */}
      <CleanNotesUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        preselectedSubjectId={selectedSubjectId}
        onUploadSuccess={(newNote) => {
          fetchNotes();
          if (newNote?._id) handleSelectNote(newNote._id);
        }}
      />
    </div>
  );
};

export default CleanNotesPage;
