import { useEffect, useState } from 'react';
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
  Network,
  ArrowRight,
} from 'lucide-react';
import { mnemonicsAPI } from '../../services/api';
import MathRenderer from '../common/MathRenderer';

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

    if (!topic.trim()) {
      setError('Please enter what you are learning.');
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
        err.response?.data?.message ||
          'Could not generate visual memory guide. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generated) return;

    setSaving(true);
    setError('');

    try {
      await mnemonicsAPI.save({
        subjectId,
        topic: generated.topic || topic,
        title: generated.title || `${generated.topic || topic} Mnemonic`,
        technique: generated.technique || technique,
        mnemonic: generated.mnemonic,
        explanation: generated.explanation,
        letterMapping: generated.letterMapping,
        originalConcept: generated.originalConcept || topic,
        example: generated.example,
        materialId: selectedMaterial?._id,
      });

      setMessage('Saved to your visual memory collection.');
      await fetchSavedMnemonics();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save mnemonic.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this memory guide?')) return;

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

  const handleEdit = async (item) => {
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
    });
  };

  const handleUpdate = async () => {
    if (!generated || !editingId) return;

    setSaving(true);
    setError('');

    try {
      await mnemonicsAPI.update(editingId, generated);
      setMessage('Memory guide updated successfully.');
      setEditingId(null);
      setGenerated(null);
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

  const filteredMnemonics = savedMnemonics.filter((item) => {
    const term = search.toLowerCase();
    return (
      item.title?.toLowerCase().includes(term) ||
      item.topic?.toLowerCase().includes(term) ||
      item.mnemonic?.toLowerCase().includes(term)
    );
  });

  return (
    <section className="space-y-6">
      {/* 1. Visual Memory Studio Hero Banner (Screenshot 1 - Brand Palette) */}
      <div className="rounded-3xl bg-gradient-to-tr from-[#2D4354] via-[#534145] to-[#9E6752] p-6 sm:p-8 text-white shadow-[0_12px_32px_-4px_rgba(45,67,84,0.22)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-[#FED7A5] text-[11px] font-bold backdrop-blur-xs border border-[#FED7A5]/30">
              <Sparkles className="w-3.5 h-3.5 text-[#FED7A5]" />
              <span>STUDYPILOT AI · LEARNING LAB</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Visual Memory Studio.
            </h2>
            <p className="text-xs sm:text-sm text-white/85 leading-relaxed">
              Turn difficult academic concepts into memorable tricks, visual connections, stories and interactive revision.
            </p>

            {/* Feature Filter Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-white font-semibold backdrop-blur-xs">
                <Lightbulb className="w-3.5 h-3.5 text-[#FED7A5]" />
                <span>Memory tricks</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-white font-semibold backdrop-blur-xs">
                <Network className="w-3.5 h-3.5 text-[#FED7A5]" />
                <span>Concept maps</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-white font-semibold backdrop-blur-xs">
                <BookOpen className="w-3.5 h-3.5 text-[#FED7A5]" />
                <span>Visual stories</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 border border-white/15 text-white font-semibold backdrop-blur-xs">
                <Brain className="w-3.5 h-3.5 text-[#FED7A5]" />
                <span>Active recall</span>
              </span>
            </div>
          </div>

          <div className="hidden md:flex items-center justify-center shrink-0">
            <div className="w-24 h-24 rounded-3xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center shadow-inner relative group hover:scale-105 transition-transform">
              <Brain className="w-12 h-12 text-[#FED7A5] drop-shadow-md" />
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#FED7A5] text-[#2D4354] flex items-center justify-center text-[10px] font-extrabold shadow-xs">
                AI
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Guide Generator Workspace (Screenshot 4) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Left: Input Form ("Create your guide") */}
        <div className="bg-white border border-[#73766A]/15 rounded-3xl p-6 sm:p-7 space-y-5 shadow-[0_4px_24px_-2px_rgba(45,67,84,0.04)]">
          <div className="flex items-center gap-3 pb-3 border-b border-[#73766A]/10">
            <div className="w-10 h-10 rounded-2xl bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5] flex items-center justify-center shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#20212B]">
                Create your guide
              </h3>
              <p className="text-xs text-[#77756F]">
                Start with a topic you want to remember.
              </p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#20212B] mb-1.5">
              What are you learning?
            </label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. 8086 stack operations, Types of modulation..."
              className="w-full rounded-2xl border border-[#73766A]/20 bg-white px-4 py-3 text-xs sm:text-sm text-[#20212B] placeholder:text-[#77756F]/60 outline-none transition-all focus:border-[#2D4354] focus:ring-4 focus:ring-[#2D4354]/10 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#20212B] mb-1.5">
              Choose a memory technique
            </label>
            <select
              value={technique}
              onChange={(e) => setTechnique(e.target.value)}
              className="w-full rounded-2xl border border-[#73766A]/20 px-4 py-3 text-xs sm:text-sm text-[#20212B] bg-white outline-none focus:border-[#2D4354] focus:ring-4 focus:ring-[#2D4354]/10 shadow-2xs"
            >
              {techniques.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {selectedMaterial ? (
            <div className="rounded-2xl border border-[#FED7A5] bg-[#FED7A5]/25 p-4 transition-all">
              <div className="flex items-center gap-2 text-[#2D4354] text-xs sm:text-sm font-bold">
                <BookOpen className="w-4 h-4 text-[#9E6752]" />
                Selected study material
              </div>
              <p className="text-xs text-[#20212B] font-semibold mt-1.5 break-words">
                {selectedMaterial.fileName}
              </p>
              <p className="text-[11px] text-[#77756F] mt-1 flex items-center gap-1.5 font-medium">
                <span className={`w-2 h-2 rounded-full ${materialReady ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                {materialReady
                  ? 'Processed and ready to use'
                  : 'Material processing is not complete yet'}
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-[#20212B] mb-1.5">
                Your notes / source content
              </label>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                rows={4}
                placeholder="Paste your notes or important concepts here..."
                className="w-full rounded-2xl border border-[#73766A]/20 bg-white px-4 py-3 text-xs sm:text-sm text-[#20212B] placeholder:text-[#77756F]/60 outline-none resize-y focus:border-[#2D4354] focus:ring-4 focus:ring-[#2D4354]/10 shadow-2xs"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-[#20212B] mb-1.5">
              Extra instructions (optional)
            </label>
            <textarea
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              rows={2}
              placeholder="e.g. Make it funny, simple, exam-focused..."
              className="w-full rounded-2xl border border-[#73766A]/20 bg-white px-4 py-2.5 text-xs sm:text-sm text-[#20212B] placeholder:text-[#77756F]/60 outline-none resize-y focus:border-[#2D4354] focus:ring-4 focus:ring-[#2D4354]/10 shadow-2xs"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || saving}
            className="w-full flex items-center justify-center gap-2 rounded-2xl bg-[#2D4354] hover:bg-[#20212B] text-white py-3.5 text-xs sm:text-sm font-bold shadow-md shadow-[#2D4354]/20 hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#FED7A5]" />
            ) : (
              <Sparkles className="w-4 h-4 text-[#FED7A5]" />
            )}
            <span>
              {loading ? 'Creating your memory guide...' : 'Generate Visual Memory Guide'}
            </span>
            <ArrowRight className="w-4 h-4 text-[#FED7A5]" />
          </button>
        </div>

        {/* Right: Memory Canvas ("Your memory canvas") */}
        <div className="bg-[#FAF8F5] border border-[#73766A]/15 rounded-3xl p-6 sm:p-7 min-h-[360px] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 pb-3 mb-4 border-b border-[#73766A]/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5] flex items-center justify-center shadow-2xs">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#20212B]">
                    Your memory canvas
                  </h3>
                  <p className="text-[11px] text-[#77756F]">
                    {generated ? 'Review and save your memory trick' : 'Your generated mnemonic appears here.'}
                  </p>
                </div>
              </div>

              {generated && !editingId && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 bg-[#2D4354] hover:bg-[#20212B] text-[#FED7A5] px-3.5 py-2 rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-60"
                >
                  {saving ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#FED7A5]" />
                  ) : (
                    <Save className="w-3.5 h-3.5 text-[#FED7A5]" />
                  )}
                  <span>Save</span>
                </button>
              )}

              {generated && editingId && (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(null);
                      setGenerated(null);
                    }}
                    className="p-2 rounded-xl border border-slate-200 text-[#77756F] hover:bg-white"
                    title="Cancel editing"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleUpdate}
                    disabled={saving}
                    className="inline-flex items-center gap-1.5 bg-[#2D4354] text-white px-3.5 py-2 rounded-xl text-xs font-bold"
                  >
                    <Check className="w-3.5 h-3.5 text-[#FED7A5]" />
                    <span>Update</span>
                  </button>
                </div>
              )}
            </div>

            {generated ? (
              <div className="space-y-4">
                <input
                  value={generated.title || ''}
                  onChange={(e) => updateGenerated('title', e.target.value)}
                  className="w-full bg-transparent text-base sm:text-lg font-black text-[#20212B] outline-none border-b border-transparent focus:border-[#2D4354]"
                />

                <div className="rounded-2xl bg-white border border-[#FED7A5] p-5 shadow-xs">
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#9E6752] mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#9E6752]" />
                    <span>Your memory trick</span>
                  </div>
                  <textarea
                    value={generated.mnemonic || ''}
                    onChange={(e) => updateGenerated('mnemonic', e.target.value)}
                    rows={3}
                    className="w-full text-sm sm:text-base font-bold text-[#20212B] leading-relaxed outline-none resize-y"
                  />
                </div>

                <div>
                  <p className="text-xs font-bold text-[#20212B] mb-1">
                    How it works
                  </p>
                  <textarea
                    value={generated.explanation || ''}
                    onChange={(e) => updateGenerated('explanation', e.target.value)}
                    rows={3}
                    className="w-full bg-white rounded-xl border border-slate-200 p-3 text-xs sm:text-sm text-[#77756F] outline-none resize-y"
                  />
                </div>

                {generated.letterMapping && (
                  <div>
                    <p className="text-xs font-bold text-[#20212B] mb-2">
                      Letter mapping
                    </p>
                    <pre className="text-xs whitespace-pre-wrap bg-white rounded-xl p-3 border border-slate-200 text-[#77756F]">
                      {typeof generated.letterMapping === 'string'
                        ? generated.letterMapping
                        : JSON.stringify(generated.letterMapping, null, 2)}
                    </pre>
                  </div>
                )}

                <div>
                  <p className="text-xs font-bold text-[#20212B] mb-1">
                    Original concept
                  </p>
                  <div className="text-xs sm:text-sm text-[#77756F] bg-white p-3 rounded-xl border border-slate-200">
                    <MathRenderer text={generated.originalConcept} />
                  </div>
                </div>

                {generated.example && (
                  <div className="rounded-xl bg-[#FFF7EC] border border-[#FED7A5] p-3.5">
                    <p className="text-xs font-bold text-[#9E6752] mb-1">
                      Example
                    </p>
                    <div className="text-xs sm:text-sm text-[#20212B]">
                      <MathRenderer text={generated.example} />
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-14 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-3xl bg-[#FFF7EC] text-[#9E6752] border border-[#FED7A5] flex items-center justify-center mb-4 shadow-xs relative">
                  <Brain className="w-8 h-8 text-[#9E6752]" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[#FED7A5] text-[#2D4354] flex items-center justify-center text-[10px] font-bold">
                    ★
                  </div>
                </div>
                <p className="text-sm font-extrabold text-[#20212B]">
                  Your memory canvas is waiting
                </p>
                <p className="text-xs text-[#77756F] mt-1.5 max-w-xs leading-relaxed">
                  Choose a topic and generate a memory trick. Your mnemonic, letter mapping and learning guide will appear here.
                </p>

                {/* Concept Guide Pills (Screenshot 4) */}
                <div className="flex items-center gap-2 mt-5">
                  <span className="text-[11px] font-bold text-[#9E6752] bg-[#FFF7EC] border border-[#FED7A5] px-3 py-1 rounded-full">
                    Remember
                  </span>
                  <span className="text-[11px] font-bold text-[#2D4354] bg-[#FED7A5]/35 border border-[#FED7A5] px-3 py-1 rounded-full">
                    Visualise
                  </span>
                  <span className="text-[11px] font-bold text-[#534145] bg-[#534145]/10 border border-[#534145]/20 px-3 py-1 rounded-full">
                    Understand
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-xs sm:text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-2xl border border-[#FED7A5] bg-[#FFF7EC] text-[#2D4354] px-4 py-3 text-xs sm:text-sm font-medium">
          {message}
        </div>
      )}

      {/* 3. Saved Mnemonics Collection */}
      <div className="bg-white border border-[#73766A]/15 rounded-3xl p-6 shadow-[0_4px_24px_-2px_rgba(45,67,84,0.04)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-3 border-b border-[#73766A]/10">
          <div>
            <h3 className="font-extrabold text-base text-[#20212B]">
              Saved Visual Memory Guides
            </h3>
            <p className="text-xs text-[#77756F] mt-0.5">
              Your personal recall collection for this subject.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#77756F]" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search guides..."
                className="pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-[#2D4354] text-[#20212B]"
              />
            </div>
            <button
              type="button"
              onClick={fetchSavedMnemonics}
              className="p-2 rounded-xl border border-slate-200 text-[#77756F] hover:bg-[#FAF8F5] cursor-pointer"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {filteredMnemonics.length === 0 ? (
          <div className="py-10 text-center">
            <Brain className="w-8 h-8 text-[#77756F]/40 mx-auto mb-2" />
            <p className="text-sm font-semibold text-[#20212B]">
              No saved memory guides yet
            </p>
            <p className="text-xs text-[#77756F] mt-1">
              Your saved memory tricks will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredMnemonics.map((item) => (
              <div
                key={item._id}
                className="border border-[#73766A]/15 rounded-2xl p-5 hover:border-[#2D4354]/40 bg-white shadow-2xs hover:shadow-xs transition-all"
              >
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-sm text-[#20212B] truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] font-semibold text-[#9E6752] mt-1">
                      {item.topic} · {techniques.find((t) => t.value === item.technique)?.label || item.technique}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleEdit(item)}
                      className="p-2 rounded-lg text-[#77756F] hover:text-[#2D4354] hover:bg-[#FED7A5]/20 cursor-pointer"
                      title="Edit mnemonic"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item._id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer"
                      title="Delete mnemonic"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-[#77756F] mt-3 whitespace-pre-wrap line-clamp-4 leading-relaxed border-t border-slate-100 pt-2.5">
                  <MathRenderer text={item.mnemonic} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MnemonicGenerator;
