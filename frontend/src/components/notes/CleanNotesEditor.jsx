import { useState } from 'react';
import MathRenderer from '../common/MathRenderer';
import { cleanNotesAPI } from '../../services/api';
import {
  ArrowLeft,
  Save,
  Printer,
  FileText,
  Sparkles,
  BookOpen,
  HelpCircle,
  AlertTriangle,
  Download,
  Eye,
  Edit3,
  ExternalLink,
  Plus,
  Trash2,
  CheckCircle2,
  Loader2
} from 'lucide-react';

const CleanNotesEditor = ({ note, onBack, onSaveSuccess }) => {
  const [activeTab, setActiveTab] = useState('structured'); // 'structured' | 'raw' | 'files'
  const [isEditing, setIsEditing] = useState(false);

  // Editable copy
  const [title, setTitle] = useState(note.title || '');
  const [chapter, setChapter] = useState(note.chapter || '');
  const [content, setContent] = useState(
    note.editedContent || note.structuredContent || {}
  );
  const [rawText, setRawText] = useState(note.extractedText || '');

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveSuccessMsg('');

      const res = await cleanNotesAPI.update(note._id, {
        title: title.trim(),
        chapter: chapter.trim(),
        editedContent: content,
      });

      if (res.data?.success) {
        setSaveSuccessMsg('Notes successfully saved!');
        setIsEditing(false);
        if (onSaveSuccess) onSaveSuccess(res.data.data);
        setTimeout(() => setSaveSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error('Failed to save note changes:', err);
      alert('Failed to save notes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleExportPdf = () => {
    const exportUrl = cleanNotesAPI.exportUrl(note._id, 'html');
    window.open(exportUrl, '_blank');
  };

  const handleExportDocx = () => {
    // Generate clean formatted document blob
    const exportText = `# ${title}\nSubject: ${note.subjectId?.subjectName || ''}\nChapter: ${chapter}\n\n` +
      (content.headings || []).map(h => `## ${h.title}\n${h.content}\n` + (h.subheadings || []).map(sub => `### ${sub.title}\n${sub.content}\n`).join('')).join('\n') +
      `\n\n### Definitions\n` + (content.definitions || []).map(d => `- **${d.term}**: ${d.definition}`).join('\n') +
      `\n\n### Key Formulas\n` + (content.formulas || []).map(f => `- **${f.name}**: ${f.expression} (${f.explanation || ''})`).join('\n') +
      `\n\n### Key Points\n` + (content.keyPoints || []).map(p => `- ${p}`).join('\n');

    const blob = new Blob([exportText], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '_')}_Clean_Notes.doc`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Helper updates for editable structured sections
  const updateHeading = (index, field, value) => {
    setContent((prev) => {
      const headings = [...(prev.headings || [])];
      headings[index] = { ...headings[index], [field]: value };
      return { ...prev, headings };
    });
  };

  const addHeading = () => {
    setContent((prev) => ({
      ...prev,
      headings: [
        ...(prev.headings || []),
        { title: 'New Heading', content: '', subheadings: [] },
      ],
    }));
  };

  const removeHeading = (index) => {
    setContent((prev) => ({
      ...prev,
      headings: (prev.headings || []).filter((_, i) => i !== index),
    }));
  };

  const addDefinition = () => {
    setContent((prev) => ({
      ...prev,
      definitions: [
        ...(prev.definitions || []),
        { term: 'New Concept', definition: '' },
      ],
    }));
  };

  const updateDefinition = (index, field, value) => {
    setContent((prev) => {
      const definitions = [...(prev.definitions || [])];
      definitions[index] = { ...definitions[index], [field]: value };
      return { ...prev, definitions };
    });
  };

  const removeDefinition = (index) => {
    setContent((prev) => ({
      ...prev,
      definitions: (prev.definitions || []).filter((_, i) => i !== index),
    }));
  };

  const addFormula = () => {
    setContent((prev) => ({
      ...prev,
      formulas: [
        ...(prev.formulas || []),
        { name: 'Formula Name', expression: '$$x = y$$', explanation: '' },
      ],
    }));
  };

  const updateFormula = (index, field, value) => {
    setContent((prev) => {
      const formulas = [...(prev.formulas || [])];
      formulas[index] = { ...formulas[index], [field]: value };
      return { ...prev, formulas };
    });
  };

  const removeFormula = (index) => {
    setContent((prev) => ({
      ...prev,
      formulas: (prev.formulas || []).filter((_, i) => i !== index),
    }));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs font-semibold text-[#77756F] hover:text-[#20212B] transition-colors self-start cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-[#2D4354]" />
          <span>Back to Clean Notes</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {saveSuccessMsg && (
            <span className="text-xs font-bold text-[#2D4354] bg-[#FFF7EC] px-3 py-1.5 rounded-xl flex items-center gap-1 border border-[#FED7A5]">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#9E6752]" />
              <span>{saveSuccessMsg}</span>
            </span>
          )}

          {/* Edit / Preview Toggle */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              isEditing
                ? 'bg-[#FFF7EC] text-[#9E6752] border-[#FED7A5]'
                : 'bg-white text-[#20212B] border-slate-200 hover:bg-[#FAF8F5]'
            }`}
          >
            {isEditing ? (
              <>
                <Eye className="w-3.5 h-3.5" />
                <span>Preview Mode</span>
              </>
            ) : (
              <>
                <Edit3 className="w-3.5 h-3.5 text-[#2D4354]" />
                <span>Edit Notes</span>
              </>
            )}
          </button>

          {/* Save Button */}
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2D4354] hover:bg-[#20212B] text-white text-xs font-semibold shadow-xs transition-all hover:scale-102 cursor-pointer"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-3.5 h-3.5 text-[#FED7A5]" />
                <span>Save Changes</span>
              </>
            )}
          </button>

          {/* Export PDF Button */}
          <button
            onClick={handleExportPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#20212B] transition-colors shadow-xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#2D4354]" />
            <span>Print / PDF</span>
          </button>

          {/* Export DOCX Button */}
          <button
            onClick={handleExportDocx}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-[#FAF8F5] text-xs font-semibold text-[#20212B] transition-colors shadow-xs cursor-pointer"
            title="Download Word/Markdown file"
          >
            <Download className="w-3.5 h-3.5 text-[#73766A]" />
            <span>DOCX</span>
          </button>
        </div>
      </div>

      {/* Note Header & Title Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#F1F0ED] shadow-[0_4px_24px_-2px_rgba(45,67,84,0.04)] space-y-3 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#FED7A5]/10 via-[#2D4354]/5 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5]">
            {note.subjectId?.subjectName || 'Course'}
          </span>
          <span className="text-xs text-[#77756F] flex items-center gap-1 font-medium">
            <BookOpen className="w-3.5 h-3.5 text-[#73766A]" />
            {isEditing ? (
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="Chapter name"
                className="px-2.5 py-0.5 border border-slate-200 rounded-lg text-xs text-[#20212B] outline-none focus:border-[#2D4354]"
              />
            ) : (
              <span>{chapter || 'Overview Notes'}</span>
            )}
          </span>
        </div>

        {isEditing ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="relative z-10 w-full text-xl sm:text-2xl font-extrabold text-[#20212B] border-b border-[#2D4354] pb-1 focus:outline-none"
          />
        ) : (
          <h1 className="relative z-10 text-xl sm:text-2xl font-extrabold text-[#20212B] tracking-tight">
            {title}
          </h1>
        )}

        {/* View Tabs */}
        <div className="relative z-10 flex items-center gap-2 pt-3 border-t border-[#F1F0ED]">
          <button
            onClick={() => setActiveTab('structured')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'structured'
                ? 'bg-[#2D4354] text-white shadow-xs'
                : 'text-[#77756F] hover:text-[#20212B] hover:bg-[#FAF8F5]'
            }`}
          >
            Structured Digital Notes
          </button>
          <button
            onClick={() => setActiveTab('raw')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'raw'
                ? 'bg-[#2D4354] text-white shadow-xs'
                : 'text-[#77756F] hover:text-[#20212B] hover:bg-[#FAF8F5]'
            }`}
          >
            Raw OCR Transcript
          </button>
          <button
            onClick={() => setActiveTab('files')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'files'
                ? 'bg-[#2D4354] text-white shadow-xs'
                : 'text-[#77756F] hover:text-[#20212B] hover:bg-[#FAF8F5]'
            }`}
          >
            Original Scanned Files ({note.originalFiles?.length || 0})
          </button>
        </div>
      </div>

      {/* TAB 1: STRUCTURED DIGITAL NOTES */}
      {activeTab === 'structured' && (
        <div className="space-y-6">
          {/* Unclear handwriting alerts if present */}
          {Array.isArray(content.unclearTextNotes) && content.unclearTextNotes.length > 0 && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
              <div className="flex items-center gap-2 font-bold text-amber-950">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Handwriting Legibility Notice</span>
              </div>
              <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-800">
                {content.unclearTextNotes.map((nt, idx) => (
                  <li key={idx}>{nt}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Main Headings & Content */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-extrabold text-slate-900">Course Concepts & Explanations</h2>
              {isEditing && (
                <button
                  onClick={addHeading}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Heading</span>
                </button>
              )}
            </div>

            {Array.isArray(content.headings) &&
              content.headings.map((heading, hIdx) => (
                <div
                  key={hIdx}
                  className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    {isEditing ? (
                      <input
                        type="text"
                        value={heading.title}
                        onChange={(e) => updateHeading(hIdx, 'title', e.target.value)}
                        className="text-base font-extrabold text-slate-900 border border-slate-200 rounded px-2 py-1 w-full"
                      />
                    ) : (
                      <h3 className="text-base font-bold text-slate-900">{heading.title}</h3>
                    )}

                    {isEditing && (
                      <button
                        onClick={() => removeHeading(hIdx)}
                        className="text-slate-400 hover:text-red-600 p-1 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={heading.content}
                      onChange={(e) => updateHeading(hIdx, 'content', e.target.value)}
                      className="w-full text-xs text-slate-700 border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  ) : (
                    heading.content && (
                      <div className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                        <MathRenderer content={heading.content} />
                      </div>
                    )
                  )}

                  {/* Subheadings */}
                  {Array.isArray(heading.subheadings) && heading.subheadings.length > 0 && (
                    <div className="pt-2 pl-4 border-l-2 border-blue-200 space-y-3">
                      {heading.subheadings.map((sub, subIdx) => (
                        <div key={subIdx} className="space-y-1">
                          <h4 className="text-xs font-bold text-slate-800">{sub.title}</h4>
                          <div className="text-xs text-slate-600 leading-relaxed">
                            <MathRenderer content={sub.content} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
          </div>

          {/* Important Definitions Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-bold text-slate-900">Important Definitions</h3>
              </div>
              {isEditing && (
                <button
                  onClick={addDefinition}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Definition</span>
                </button>
              )}
            </div>

            {Array.isArray(content.definitions) && content.definitions.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {content.definitions.map((def, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1 relative"
                  >
                    {isEditing ? (
                      <div className="space-y-1.5 pr-6">
                        <input
                          type="text"
                          value={def.term}
                          onChange={(e) => updateDefinition(idx, 'term', e.target.value)}
                          placeholder="Term"
                          className="font-bold text-xs text-blue-900 w-full border border-slate-200 rounded px-2 py-0.5"
                        />
                        <textarea
                          rows={2}
                          value={def.definition}
                          onChange={(e) => updateDefinition(idx, 'definition', e.target.value)}
                          placeholder="Definition text"
                          className="text-xs text-slate-700 w-full border border-slate-200 rounded px-2 py-1"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="font-bold text-xs text-blue-900">{def.term}</div>
                        <div className="text-xs text-slate-600 leading-relaxed">
                          <MathRenderer content={def.definition} />
                        </div>
                      </>
                    )}

                    {isEditing && (
                      <button
                        onClick={() => removeDefinition(idx)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No definitions extracted from notes.</p>
            )}
          </div>

          {/* Key Formulas Section */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">Formulas & Mathematical Expressions</h3>
              </div>
              {isEditing && (
                <button
                  onClick={addFormula}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Formula</span>
                </button>
              )}
            </div>

            {Array.isArray(content.formulas) && content.formulas.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {content.formulas.map((form, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-2 relative"
                  >
                    {isEditing ? (
                      <div className="space-y-1.5 pr-6">
                        <input
                          type="text"
                          value={form.name}
                          onChange={(e) => updateFormula(idx, 'name', e.target.value)}
                          placeholder="Formula / Theorem Name"
                          className="font-bold text-xs text-indigo-900 w-full border border-slate-200 rounded px-2 py-0.5"
                        />
                        <input
                          type="text"
                          value={form.expression}
                          onChange={(e) => updateFormula(idx, 'expression', e.target.value)}
                          placeholder="LaTeX expression, e.g. $$E=mc^2$$"
                          className="text-xs text-slate-800 font-mono w-full border border-slate-200 rounded px-2 py-0.5"
                        />
                        <input
                          type="text"
                          value={form.explanation}
                          onChange={(e) => updateFormula(idx, 'explanation', e.target.value)}
                          placeholder="Variables explanation"
                          className="text-[11px] text-slate-500 w-full border border-slate-200 rounded px-2 py-0.5"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="font-bold text-xs text-indigo-950">{form.name}</div>
                        <div className="py-1">
                          <MathRenderer content={form.expression} />
                        </div>
                        {form.explanation && (
                          <p className="text-[11px] text-slate-500 leading-relaxed">
                            {form.explanation}
                          </p>
                        )}
                      </>
                    )}

                    {isEditing && (
                      <button
                        onClick={() => removeFormula(idx)}
                        className="absolute top-2 right-2 text-slate-400 hover:text-red-600 p-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">No mathematical formulas present in this note.</p>
            )}
          </div>

          {/* Key Bullet Points */}
          {Array.isArray(content.keyPoints) && content.keyPoints.length > 0 && (
            <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Key Takeaways & Summaries</h3>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-slate-700 leading-relaxed">
                {content.keyPoints.map((pt, idx) => (
                  <li key={idx}>{pt}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: RAW OCR TRANSCRIPT */}
      {activeTab === 'raw' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">Original OCR Extracted Transcript</h3>
            <span className="text-[11px] text-slate-400">Read-only system OCR output</span>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 font-mono text-xs text-slate-700 whitespace-pre-wrap leading-relaxed max-h-[500px] overflow-y-auto border border-slate-200/70">
            {rawText || 'No raw OCR transcript text recorded.'}
          </div>
        </div>
      )}

      {/* TAB 3: ORIGINAL SCANNED FILES */}
      {activeTab === 'files' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="text-sm font-bold text-slate-900">Original Uploaded Note Files</h3>
          <p className="text-xs text-slate-500">
            Click on any file to open the original uploaded handwritten page or document.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {note.originalFiles?.map((f, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <span className="font-bold text-xs text-slate-800 truncate">{f.fileName}</span>
                  </div>
                  <span className="text-[10px] text-slate-400">
                    {(f.fileSize / 1024).toFixed(0)} KB &bull; {f.fileType?.toUpperCase()}
                  </span>
                </div>

                {f.fileUrl && (
                  <a
                    href={f.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 hover:text-blue-800"
                  >
                    <span>View Original File</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CleanNotesEditor;
