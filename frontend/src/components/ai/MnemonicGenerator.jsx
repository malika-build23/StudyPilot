
import { useEffect, useId, useRef, useState } from 'react';
import {
  Sparkles,
  Brain,
  Save,
  Trash2,
  Search,
  Loader2,
  RefreshCw,
  BookOpen,
  Pencil,
  X,
  Check,
  Lightbulb,
  Eye,
  EyeOff,
  Image,
  Network,
  BookMarked,
  Target,
  Zap,
  Star,
  Layers,
  ArrowRight,
  WandSparkles,
  GraduationCap,
  ChevronRight,
  Clock3,
} from 'lucide-react';
import mermaid from 'mermaid';
import { mnemonicsAPI } from '../../services/api';

const techniques = [
  { value: 'acronym', label: 'Acronym' },
  { value: 'acrostic', label: 'Acrostic' },
  { value: 'rhyme', label: 'Rhyme' },
  { value: 'first-letter-association', label: 'First-letter association' },
  { value: 'word-association', label: 'Word association' },
  { value: 'memory-story', label: 'Memory story' },
  { value: 'formula-trick', label: 'Formula trick' },
  { value: 'step-by-step', label: 'Step-by-step technique' },
];

const iconMap = {
  brain: Brain,
  lightbulb: Lightbulb,
  zap: Zap,
  star: Star,
  book: BookOpen,
  target: Target,
  layers: Layers,
  sparkles: Sparkles,
  image: Image,
  network: Network,
};

const getVisualIcon = (name) => {
  const normalized = String(name || '')
    .toLowerCase()
    .replace(/[^a-z]/g, '');

  return iconMap[normalized] || Lightbulb;
};

const SectionHeading = ({ icon: Icon, title, subtitle, count }) => (
  <div className="flex items-start justify-between gap-3 mb-5">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5" />
      </div>

      <div>
        <h3 className="text-base font-bold text-slate-900">{title}</h3>
        {subtitle && (
          <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
        )}
      </div>
    </div>

    {count !== undefined && (
      <span className="rounded-full bg-violet-50 text-violet-700 px-3 py-1 text-xs font-bold shrink-0">
        {count} items
      </span>
    )}
  </div>
);

const MermaidDiagram = ({ source }) => {
  const containerRef = useRef(null);
  const generatedId = useId();

  useEffect(() => {
    let cancelled = false;

    const renderDiagram = async () => {
      if (!source || !containerRef.current) return;

      const cleanSource = source
        .replace(/^```mermaid\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/```\s*$/i, '')
        .trim();

      if (
        !/^(flowchart|graph)\s+(TD|TB|BT|RL|LR)\b/i.test(cleanSource) ||
        /<script|javascript:|click\s|%%\{init/i.test(cleanSource)
      ) {
        containerRef.current.textContent =
          'This diagram could not be rendered safely.';
        return;
      }

      try {
        mermaid.initialize({
          startOnLoad: false,
          securityLevel: 'strict',
          theme: 'base',
          themeVariables: {
            primaryColor: '#ede9fe',
            primaryTextColor: '#312e81',
            primaryBorderColor: '#a78bfa',
            lineColor: '#8b5cf6',
            secondaryColor: '#f5f3ff',
            tertiaryColor: '#fff7ed',
            fontFamily: 'Inter, sans-serif',
          },
          flowchart: {
            htmlLabels: false,
            curve: 'basis',
          },
        });

        const id = `mnemonic-${generatedId.replace(/[^a-zA-Z0-9]/g, '')}`;

        const { svg } = await mermaid.render(id, cleanSource);

        if (cancelled || !containerRef.current) return;

        containerRef.current.innerHTML = svg;
      } catch (error) {
        console.error('[Mnemonic Diagram Error]', error);

        if (containerRef.current && !cancelled) {
          containerRef.current.textContent =
            'Unable to render this concept map. Try generating it again.';
        }
      }
    };

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [source, generatedId]);

  if (!source) return null;

  return (
    <div className="w-full overflow-x-auto rounded-2xl bg-gradient-to-br from-slate-50 to-violet-50 border border-violet-100 p-4 min-h-48 flex items-center justify-center">
      <div
        ref={containerRef}
        className="w-full flex items-center justify-center text-xs text-slate-400 [&_svg]:max-w-full [&_svg]:h-auto"
      >
        Rendering concept map...
      </div>
    </div>
  );
};

const LetterMapping = ({ mapping }) => {
  if (!mapping) return null;

  let entries = [];

  if (typeof mapping === 'string') {
    try {
      const parsed = JSON.parse(mapping);
      entries = Object.entries(parsed);
    } catch {
      return (
        <div className="rounded-xl bg-white border border-violet-100 p-4 text-sm text-slate-700 whitespace-pre-wrap">
          {mapping}
        </div>
      );
    }
  } else if (typeof mapping === 'object' && !Array.isArray(mapping)) {
    entries = Object.entries(mapping);
  }

  if (!entries.length) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {entries.map(([letter, meaning], index) => (
        <div
          key={`${letter}-${index}`}
          className="flex items-start gap-3 rounded-xl border border-violet-100 bg-white p-3 hover:border-violet-300 hover:shadow-sm transition-all"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white flex items-center justify-center text-lg font-black shrink-0 shadow-sm">
            {letter}
          </div>

          <div className="min-w-0 pt-0.5">
            <p className="text-sm font-semibold text-slate-800 break-words">
              {String(meaning)}
            </p>
            <p className="text-[10px] uppercase tracking-wider text-violet-500 mt-1 font-bold">
              Memory connection
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

const MnemonicGenerator = ({ subjectId, selectedMaterial }) => {
  const [topic, setTopic] = useState('');
  const [technique, setTechnique] = useState('acronym');
  const [sourceText, setSourceText] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  const [generated, setGenerated] = useState(null);
  const [savedMnemonics, setSavedMnemonics] = useState([]);
  const [search, setSearch] = useState('');

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [revealedAnswers, setRevealedAnswers] = useState({});

  const materialReady =
    selectedMaterial?.processingStatus === 'completed';

  const fetchSavedMnemonics = async () => {
    try {
      const response = await mnemonicsAPI.getAll({ subjectId });
      setSavedMnemonics(response.data.data || []);
    } catch (err) {
      setError(
        err.response?.data?.message || 'Could not load saved mnemonics.'
      );
    }
  };

  useEffect(() => {
    if (subjectId) fetchSavedMnemonics();
  }, [subjectId]);

  const handleGenerate = async () => {
    setError('');
    setMessage('');
    setGenerated(null);
    setEditingId(null);
    setRevealedAnswers({});

    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }

    if (!selectedMaterial && !sourceText.trim()) {
      setError('Select a processed study material or enter your notes.');
      return;
    }

    if (selectedMaterial && !materialReady) {
      setError('The selected material has not finished processing.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        subjectId,
        topic: topic.trim(),
        technique,
        additionalInstructions,
        ...(selectedMaterial
          ? { materialId: selectedMaterial._id }
          : { sourceText: sourceText.trim() }),
      };

      const response = await mnemonicsAPI.generate(payload);
      setGenerated(response.data.data);
      setMessage('Your visual memory guide is ready!');
    } catch (err) {
      setError(
        err.response?.data?.message || 'Mnemonic generation failed.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generated) return;

    setSaving(true);
    setError('');
    setMessage('');

    try {
      const payload = {
        subjectId,
        materialId: selectedMaterial?._id || null,
        ...generated,
      };

      await mnemonicsAPI.save(payload);
      setMessage('Mnemonic saved successfully!');
      setGenerated(null);
      setRevealedAnswers({});
      await fetchSavedMnemonics();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save mnemonic.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this saved mnemonic?')) return;

    try {
      await mnemonicsAPI.delete(id);

      setSavedMnemonics((previous) =>
        previous.filter((item) => item._id !== id)
      );

      setMessage('Mnemonic deleted.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete mnemonic.');
    }
  };

  const handleEdit = (item) => {
    setEditingId(item._id);

    setGenerated({
      topic: item.topic,
      title: item.title,
      technique: item.technique,
      mnemonic: item.mnemonic,
      explanation: item.explanation,
      letterMapping: item.letterMapping,
      originalConcept: item.originalConcept,
      example: item.example || '',
      visualAssociations: item.visualAssociations || [],
      memoryChart: item.memoryChart || [],
      diagram: item.diagram || {
        type: 'concept-map',
        source: '',
        explanation: '',
      },
      storyScenes: item.storyScenes || [],
      recallQuestions: item.recallQuestions || [],
    });

    setRevealedAnswers({});
    setError('');
    setMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdate = async () => {
    if (!generated || !editingId) return;

    setSaving(true);
    setError('');

    try {
      await mnemonicsAPI.update(editingId, generated);

      setMessage('Mnemonic updated successfully.');
      setEditingId(null);
      setGenerated(null);
      setRevealedAnswers({});
      await fetchSavedMnemonics();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update mnemonic.');
    } finally {
      setSaving(false);
    }
  };

  const updateGenerated = (field, value) => {
    setGenerated((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const toggleAnswer = (index) => {
    setRevealedAnswers((previous) => ({
      ...previous,
      [index]: !previous[index],
    }));
  };

  const filteredMnemonics = savedMnemonics.filter((item) => {
    const term = search.toLowerCase();

    return (
      item.title?.toLowerCase().includes(term) ||
      item.topic?.toLowerCase().includes(term) ||
      item.mnemonic?.toLowerCase().includes(term)
    );
  });

  const hasVisualContent =
    generated &&
    (
      generated.visualAssociations?.length ||
      generated.memoryChart?.length ||
      generated.diagram?.source ||
      generated.storyScenes?.length ||
      generated.recallQuestions?.length
    );

  const cancelEditing = () => {
    setEditingId(null);
    setGenerated(null);
    setRevealedAnswers({});
  };

  return (
    <section className="space-y-7">
      {/* Page header */}
      <div className="relative overflow-hidden rounded-3xl bg-[#17132F] text-white shadow-xl">
        <div className="absolute inset-0 opacity-40 bg-[radial-gradient(circle_at_80%_20%,#8B5CF6,transparent_35%),radial-gradient(circle_at_10%_100%,#4338CA,transparent_35%)]" />
        <div className="absolute -right-16 -top-20 w-72 h-72 rounded-full border border-white/10" />
        <div className="absolute -right-8 -top-12 w-56 h-56 rounded-full border border-white/10" />

        <div className="relative p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-violet-300/20 bg-violet-300/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-violet-200 mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                StudyPilot AI · Learning Lab
              </div>

              <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
                Visual Memory
                <span className="block text-violet-300">Studio.</span>
              </h2>

              <p className="text-sm sm:text-base text-violet-100/70 mt-3 leading-relaxed max-w-xl">
                Turn difficult academic concepts into memorable tricks,
                visual connections, stories and interactive revision.
              </p>
            </div>

            <div className="hidden lg:flex items-center justify-center w-32 h-32 rounded-[2rem] border border-white/10 bg-white/5 backdrop-blur-sm rotate-6">
              <Brain className="w-16 h-16 text-violet-200" strokeWidth={1.2} />
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-7">
            {[
              { icon: Lightbulb, label: 'Memory tricks' },
              { icon: Network, label: 'Concept maps' },
              { icon: BookMarked, label: 'Visual stories' },
              { icon: Target, label: 'Active recall' },
            ].map(({ icon: Icon, label }) => (
              <div
                key={label}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-3 py-3"
              >
                <Icon className="w-4 h-4 text-violet-300 shrink-0" />
                <span className="text-xs font-medium text-violet-100">
                  {label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Generator */}
      <div className="grid grid-cols-1 lg:grid-cols-[0.85fr_1.15fr] gap-5 items-start">
        {/* Input panel */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
                <WandSparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  Create your guide
                </h3>
                <p className="text-xs text-slate-500">
                  Start with a topic you want to remember.
                </p>
              </div>
            </div>
          </div>

          <div className="p-5 space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                What are you learning?
              </label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. 8086 stack operations"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Choose a memory technique
              </label>
              <select
                value={technique}
                onChange={(e) => setTechnique(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              >
                {techniques.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {selectedMaterial ? (
              <div className="rounded-xl border border-violet-200 bg-violet-50/80 p-4">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                    <BookOpen className="w-4 h-4" />
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-violet-900">
                      Selected study material
                    </p>
                    <p className="text-xs text-violet-700 mt-1 break-words">
                      {selectedMaterial.fileName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          materialReady ? 'bg-emerald-500' : 'bg-amber-500'
                        }`}
                      />
                      <p className="text-[11px] text-violet-700">
                        {materialReady
                          ? 'Processed and ready to use'
                          : 'Waiting for material processing'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Your notes / source content
                </label>
                <textarea
                  value={sourceText}
                  onChange={(e) => setSourceText(e.target.value)}
                  rows={5}
                  placeholder="Paste your class notes, definitions, formulas or important concepts..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none resize-y focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Extra instructions
                <span className="font-normal text-slate-400 ml-1">
                  (optional)
                </span>
              </label>
              <textarea
                value={additionalInstructions}
                onChange={(e) => setAdditionalInstructions(e.target.value)}
                rows={2}
                placeholder="Make it funny, simple, exam-focused..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none resize-y focus:bg-white focus:border-violet-400 focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <button
              type="button"
              onClick={handleGenerate}
              disabled={loading || saving}
              className="group w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white py-3.5 text-sm font-bold transition-all hover:shadow-lg hover:shadow-violet-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              )}

              {loading
                ? 'Creating your memory guide...'
                : 'Generate Visual Memory Guide'}

              {!loading && <ArrowRight className="w-4 h-4 ml-1" />}
            </button>

            <p className="text-center text-[10px] text-slate-400">
              <Zap className="w-3 h-3 inline mr-1 text-amber-500" />
              AI-generated learning aid · Always verify technical details
            </p>
          </div>
        </div>

        {/* Generated mnemonic preview */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">
                    Your memory canvas
                  </h3>
                  <p className="text-xs text-slate-500">
                    Your generated mnemonic appears here.
                  </p>
                </div>
              </div>
            </div>

            {generated && (
              <div className="flex items-center gap-2">
                {editingId ? (
                  <>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                      title="Cancel editing"
                    >
                      <X className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={handleUpdate}
                      disabled={saving}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 text-xs font-bold disabled:opacity-60"
                    >
                      {saving ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <Check className="w-3.5 h-3.5" />
                      )}
                      Update
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 hover:bg-violet-700 text-white px-3 py-2 text-xs font-bold disabled:opacity-60"
                  >
                    {saving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Save guide
                  </button>
                )}
              </div>
            )}
          </div>

          {generated ? (
            <div className="p-5 space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                  Guide title
                </label>
                <input
                  value={generated.title || ''}
                  onChange={(e) => updateGenerated('title', e.target.value)}
                  className="w-full text-lg font-bold text-slate-900 outline-none border-b border-transparent focus:border-violet-300 pb-1"
                  placeholder="Your mnemonic title"
                />
              </div>

              {/* Main mnemonic card */}
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#211744] via-[#38216F] to-[#5141A0] p-5 sm:p-6 text-white">
                <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-violet-300/10 blur-2xl" />
                <div className="relative">
                  <div className="flex items-center gap-2 text-violet-200 text-[10px] font-bold uppercase tracking-[0.2em] mb-4">
                    <Sparkles className="w-4 h-4" />
                    Your memory trick
                  </div>

                  <textarea
                    value={generated.mnemonic || ''}
                    onChange={(e) =>
                      updateGenerated('mnemonic', e.target.value)
                    }
                    rows={2}
                    className="w-full bg-transparent text-3xl sm:text-4xl font-black tracking-[0.12em] text-white outline-none resize-y placeholder:text-white/40"
                    placeholder="Your mnemonic"
                  />

                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1 text-[10px] font-semibold text-violet-100">
                      {techniques.find((t) => t.value === generated.technique)?.label ||
                        generated.technique ||
                        'Memory technique'}
                    </span>
                    {generated.topic && (
                      <span className="rounded-full bg-white/10 border border-white/10 px-3 py-1 text-[10px] font-semibold text-violet-100">
                        {generated.topic}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Explanation */}
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  <p className="text-xs font-bold text-slate-800">
                    How to remember it
                  </p>
                </div>
                <textarea
                  value={generated.explanation || ''}
                  onChange={(e) =>
                    updateGenerated('explanation', e.target.value)
                  }
                  rows={3}
                  className="w-full bg-transparent text-sm text-slate-600 leading-relaxed outline-none resize-y"
                />
              </div>

              {/* Letter mapping */}
              {generated.letterMapping && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Layers className="w-4 h-4 text-violet-600" />
                    <p className="text-xs font-bold text-slate-800">
                      Decode your mnemonic
                    </p>
                  </div>
                  <LetterMapping mapping={generated.letterMapping} />
                </div>
              )}

              <div className="rounded-xl border border-indigo-100 bg-indigo-50/70 p-4">
                <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 mb-1">
                  The actual concept
                </p>
                <p className="text-sm text-indigo-950 leading-relaxed">
                  {generated.originalConcept}
                </p>
              </div>

              {generated.example && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700 mb-1">
                    Try this example
                  </p>
                  <p className="text-sm text-amber-950 leading-relaxed">
                    {generated.example}
                  </p>
                </div>
              )}

              {!hasVisualContent && (
                <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
                  This response contains the basic mnemonic but no visual
                  sections. Check that your updated Gemini service is being
                  used by the backend.
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                <p className="text-[10px] text-slate-400">
                  Review the guide, then save it to your collection.
                </p>
                {!editingId && (
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-violet-600 hover:text-violet-800"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Regenerate
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="min-h-[370px] flex flex-col items-center justify-center text-center p-8">
              <div className="relative mb-5">
                <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-violet-100 to-indigo-100 flex items-center justify-center">
                  <Brain className="w-11 h-11 text-violet-500" strokeWidth={1.4} />
                </div>
                <div className="absolute -right-2 -top-2 w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center border-4 border-white">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>

              <h4 className="text-base font-bold text-slate-800">
                Your memory canvas is waiting
              </h4>

              <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
                Choose a topic and generate a memory trick. Your mnemonic,
                letter mapping and learning guide will appear here.
              </p>

              <div className="flex flex-wrap justify-center gap-2 mt-5">
                {['Remember', 'Visualise', 'Understand'].map((label) => (
                  <span
                    key={label}
                    className="rounded-full bg-violet-50 text-violet-600 px-3 py-1.5 text-[10px] font-bold"
                  >
                    {label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Status messages */}
      {error && (
        <div className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
          <X className="w-4 h-4 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {message && (
        <div className="flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
          <Check className="w-4 h-4 mt-0.5 shrink-0" />
          {message}
        </div>
      )}

      {/* Visual learning sections */}
      {generated && (
        <div className="space-y-5">
          {/* Section divider */}
          <div className="flex items-center gap-3 pt-2">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-violet-500">
              Explore your memory guide
            </span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          {/* Visual associations */}
          {generated.visualAssociations?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <SectionHeading
                icon={Image}
                title="Visual associations"
                subtitle="Connect difficult concepts with simple visual cues."
                count={generated.visualAssociations.length}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {generated.visualAssociations.map((item, index) => {
                  const Icon = getVisualIcon(item.symbol);

                  return (
                    <div
                      key={index}
                      className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-violet-50/70 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100"
                    >
                      <div className="absolute -right-8 -top-8 w-24 h-24 rounded-full bg-violet-100/70 blur-2xl group-hover:bg-violet-200/70 transition-colors" />

                      <div className="relative">
                        <div className="flex items-center justify-between mb-4">
                          <div className="w-12 h-12 rounded-2xl bg-violet-100 text-violet-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Icon className="w-6 h-6" />
                          </div>
                          <span className="text-xs font-black text-violet-200">
                            0{index + 1}
                          </span>
                        </div>

                        <h4 className="font-bold text-sm text-slate-900">
                          {item.concept}
                        </h4>

                        <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                          {item.visualDescription}
                        </p>

                        {item.memoryHint && (
                          <div className="mt-4 rounded-xl bg-white/80 border border-violet-100 p-3">
                            <p className="text-[9px] font-black uppercase tracking-wider text-violet-600 mb-1">
                              Memory connection
                            </p>
                            <p className="text-xs text-violet-900 leading-relaxed">
                              {item.memoryHint}
                            </p>
                          </div>
                        )}

                        {item.illustrationPrompt && (
                          <p className="text-[10px] text-slate-400 mt-3 italic">
                            Visual idea: {item.illustrationPrompt}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Memory chart */}
          {generated.memoryChart?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <SectionHeading
                icon={Layers}
                title="Memory chart"
                subtitle="Your compact revision sheet. Use it for a quick recap before exams."
                count={generated.memoryChart.length}
              />

              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="w-full text-left text-xs min-w-[600px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-600">
                      <th className="px-4 py-3 font-bold">Keyword</th>
                      <th className="px-4 py-3 font-bold">Meaning</th>
                      <th className="px-4 py-3 font-bold">Association</th>
                      <th className="px-4 py-3 font-bold">Importance</th>
                    </tr>
                  </thead>

                  <tbody>
                    {generated.memoryChart.map((item, index) => (
                      <tr
                        key={index}
                        className="border-t border-slate-100 hover:bg-violet-50/50 transition-colors"
                      >
                        <td className="px-4 py-3 font-bold text-violet-800">
                          {item.keyword}
                        </td>
                        <td className="px-4 py-3 text-slate-600 leading-relaxed">
                          {item.meaning}
                        </td>
                        <td className="px-4 py-3 text-slate-600 leading-relaxed">
                          {item.association}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold ${
                              item.importance === 'high'
                                ? 'bg-rose-50 text-rose-700'
                                : item.importance === 'low'
                                  ? 'bg-slate-100 text-slate-600'
                                  : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {item.importance || 'medium'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Concept map */}
          {generated.diagram?.source && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <SectionHeading
                icon={Network}
                title="Concept map"
                subtitle="Understand the relationships between different concepts."
              />

              <MermaidDiagram source={generated.diagram.source} />

              {generated.diagram.explanation && (
                <div className="mt-4 rounded-xl bg-indigo-50 border border-indigo-100 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="w-4 h-4 text-indigo-600" />
                    <p className="text-xs font-bold text-indigo-900">
                      Understand the connections
                    </p>
                  </div>
                  <p className="text-sm text-indigo-800 leading-relaxed">
                    {generated.diagram.explanation}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Story scenes */}
          {generated.storyScenes?.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
              <SectionHeading
                icon={BookMarked}
                title="Learn it as a story"
                subtitle="Follow the sequence and connect each scene to an academic concept."
                count={generated.storyScenes.length}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {generated.storyScenes.map((scene, index) => (
                  <div
                    key={index}
                    className="relative rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-amber-50/50 p-4 hover:border-amber-200 transition-all"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0">
                        {scene.sceneNumber || index + 1}
                      </div>

                      <div className="min-w-0">
                        <p className="text-[9px] font-bold uppercase tracking-wider text-amber-600">
                          Scene {scene.sceneNumber || index + 1}
                        </p>
                        <h4 className="font-bold text-sm text-slate-900 mt-1">
                          {scene.title}
                        </h4>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed mt-4">
                      {scene.description}
                    </p>

                    {scene.conceptsRepresented?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-4">
                        {scene.conceptsRepresented.map((concept, i) => (
                          <span
                            key={i}
                            className="rounded-full bg-amber-100 text-amber-800 px-2.5 py-1 text-[10px] font-semibold"
                          >
                            {concept}
                          </span>
                        ))}
                      </div>
                    )}

                    {scene.visualPrompt && (
                      <div className="mt-4 pt-3 border-t border-amber-100">
                        <p className="text-[10px] text-slate-400 italic leading-relaxed">
                          <Image className="w-3 h-3 inline mr-1" />
                          {scene.visualPrompt}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active recall */}
          {generated.recallQuestions?.length > 0 && (
            <div className="relative overflow-hidden bg-[#17132F] rounded-2xl p-5 sm:p-7 text-white shadow-lg">
              <div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-violet-500/20 blur-3xl" />

              <div className="relative">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/10 text-violet-200 flex items-center justify-center">
                      <Target className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">
                        Test your memory
                      </h3>
                      <p className="text-xs text-violet-200/70 mt-0.5">
                        Can you recall these without looking at your notes?
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] font-bold text-violet-200 bg-white/10 border border-white/10 rounded-full px-3 py-1.5 self-start sm:self-auto">
                    {generated.recallQuestions.length} QUESTIONS
                  </span>
                </div>

                <div className="space-y-3">
                  {generated.recallQuestions.map((item, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-white/10 bg-white/[0.06] p-4 transition-colors hover:bg-white/[0.09]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-lg bg-violet-400/20 text-violet-200 flex items-center justify-center text-xs font-black shrink-0">
                          {String(index + 1).padStart(2, '0')}
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white leading-relaxed">
                            {item.question}
                          </p>

                          {item.hint && (
                            <p className="text-xs text-violet-200/70 mt-2">
                              <Lightbulb className="w-3.5 h-3.5 inline mr-1" />
                              Hint: {item.hint}
                            </p>
                          )}

                          {revealedAnswers[index] && (
                            <div className="mt-4 rounded-xl border border-emerald-300/20 bg-emerald-300/10 p-3">
                              <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-200 mb-1">
                                Correct answer
                              </p>
                              <p className="text-sm text-white leading-relaxed">
                                {item.answer}
                              </p>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => toggleAnswer(index)}
                            className="mt-3 inline-flex items-center gap-2 rounded-lg bg-white/10 hover:bg-white/15 px-3 py-2 text-xs font-bold text-violet-100 transition-colors"
                          >
                            {revealedAnswers[index] ? (
                              <>
                                <EyeOff className="w-3.5 h-3.5" />
                                Hide answer
                              </>
                            ) : (
                              <>
                                <Eye className="w-3.5 h-3.5" />
                                Reveal answer
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Saved mnemonics */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 sm:p-6 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                <BookMarked className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900">
                  My memory collection
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  All your saved memory guides in one place.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="relative flex-1 sm:flex-none">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search your guides..."
                  className="w-full sm:w-56 pl-9 pr-3 py-2.5 text-xs border border-slate-200 rounded-xl outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
                />
              </div>

              <button
                type="button"
                onClick={fetchSavedMnemonics}
                className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:text-violet-600 hover:bg-violet-50 transition-colors"
                title="Refresh collection"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-5 sm:p-6">
          {filteredMnemonics.length === 0 ? (
            <div className="py-10 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-7 h-7" />
              </div>

              <p className="text-sm font-bold text-slate-700">
                {search ? 'No matching guides found' : 'Your collection is empty'}
              </p>

              <p className="text-xs text-slate-400 mt-1">
                {search
                  ? 'Try searching with another topic or mnemonic.'
                  : 'Generate and save your first memory guide to see it here.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredMnemonics.map((item) => (
                <div
                  key={item._id}
                  className="group rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-4 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-100/60 transition-all duration-300"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm text-slate-900 truncate">
                        {item.title}
                      </h4>
                      <p className="text-[11px] text-violet-600 mt-1">
                        {item.topic} ·{' '}
                        {techniques.find((t) => t.value === item.technique)?.label ||
                          item.technique}
                      </p>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="p-2 rounded-lg text-slate-400 hover:text-violet-600 hover:bg-violet-50"
                        title="Edit mnemonic"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item._id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50"
                        title="Delete mnemonic"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="rounded-xl bg-gradient-to-br from-violet-100 to-indigo-100 p-3 mt-4">
                    <p className="text-[9px] font-bold uppercase tracking-wider text-violet-500 mb-1">
                      Memory trick
                    </p>
                    <p className="text-lg font-black tracking-wider text-violet-950 line-clamp-2">
                      {item.mnemonic}
                    </p>
                  </div>

                  <p className="text-xs text-slate-500 mt-3 line-clamp-2 leading-relaxed">
                    {item.explanation}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mt-4">
                    {item.visualAssociations?.length > 0 && (
                      <span className="text-[10px] font-semibold rounded-full bg-violet-50 text-violet-700 px-2.5 py-1">
                        Visuals
                      </span>
                    )}
                    {item.diagram?.source && (
                      <span className="text-[10px] font-semibold rounded-full bg-indigo-50 text-indigo-700 px-2.5 py-1">
                        Concept map
                      </span>
                    )}
                    {item.storyScenes?.length > 0 && (
                      <span className="text-[10px] font-semibold rounded-full bg-amber-50 text-amber-700 px-2.5 py-1">
                        Story
                      </span>
                    )}
                    {item.recallQuestions?.length > 0 && (
                      <span className="text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700 px-2.5 py-1">
                        Recall quiz
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100">
                    <span className="text-[10px] text-slate-400">
                      <Clock3 className="w-3 h-3 inline mr-1" />
                      Saved guide
                    </span>

                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-violet-600 hover:text-violet-800"
                    >
                      Open guide
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default MnemonicGenerator;
