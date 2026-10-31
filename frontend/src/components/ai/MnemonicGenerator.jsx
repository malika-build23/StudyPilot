
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
} from 'lucide-react';
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
      setMessage('Your mnemonic is ready!');
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
      setMessage('Mnemonic updated successfully.');
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center">
              <Brain className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                AI Mnemonics Studio
              </h2>
              <p className="text-xs text-slate-500">
                Turn difficult concepts into memorable learning shortcuts.
              </p>
            </div>
          </div>
        </div>
        <span className="text-xs font-semibold text-violet-700 bg-violet-50 border border-violet-100 rounded-full px-3 py-1.5">
          Powered by Gemini AI
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-sm">
          <div>
            <h3 className="font-bold text-slate-800">Create a mnemonic</h3>
            <p className="text-xs text-slate-500 mt-1">
              Choose a topic and how you want to remember it.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Topic
            </label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Types of modulation"
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-violet-400 focus:ring-2 focus:ring-violet-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Mnemonic technique
            </label>
            <select
              value={technique}
              onChange={(e) => setTechnique(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm bg-white outline-none focus:border-violet-400"
            >
              {techniques.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {selectedMaterial ? (
            <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
              <div className="flex items-center gap-2 text-violet-800 text-sm font-semibold">
                <BookOpen className="w-4 h-4" />
                Selected study material
              </div>
              <p className="text-xs text-violet-700 mt-1 break-words">
                {selectedMaterial.fileName}
              </p>
              <p className="text-[11px] text-violet-600 mt-1">
                {materialReady
                  ? 'Processed material will be used as the source.'
                  : 'Material processing is not complete yet.'}
              </p>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Your notes / source content
              </label>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                rows={5}
                placeholder="Paste your notes or important concepts here..."
                className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none resize-y focus:border-violet-400"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Additional instructions (optional)
            </label>
            <textarea
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              rows={2}
              placeholder="e.g. Make it simple, funny and easy to recall."
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none resize-y focus:border-violet-400"
            />
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || saving}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white py-3 text-sm font-semibold transition-colors disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {loading ? 'Creating your mnemonic...' : 'Generate Mnemonic'}
          </button>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 min-h-[300px]">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="font-bold text-slate-800">Mnemonic preview</h3>
            {generated && !editingId && (
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="inline-flex items-center gap-1.5 bg-violet-600 text-white px-3 py-2 rounded-lg text-xs font-semibold disabled:opacity-60"
              >
                {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                Save
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
                  className="p-2 rounded-lg border border-slate-200 text-slate-600"
                  title="Cancel editing"
                >
                  <X className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={saving}
                  className="inline-flex items-center gap-1.5 bg-violet-600 text-white px-3 py-2 rounded-lg text-xs font-semibold"
                >
                  <Check className="w-3.5 h-3.5" />
                  Update
                </button>
              </div>
            )}
          </div>

          {generated ? (
            <div className="space-y-4">
              <input
                value={generated.title || ''}
                onChange={(e) => updateGenerated('title', e.target.value)}
                className="w-full bg-transparent text-lg font-bold text-slate-900 outline-none border-b border-transparent focus:border-violet-300"
              />

              <div className="rounded-xl bg-white border border-violet-200 p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-violet-600 mb-2">
                  Your memory trick
                </div>
                <textarea
                  value={generated.mnemonic || ''}
                  onChange={(e) => updateGenerated('mnemonic', e.target.value)}
                  rows={3}
                  className="w-full text-base font-semibold text-slate-900 leading-relaxed outline-none resize-y"
                />
              </div>

              <div>
                <p className="text-xs font-bold text-slate-700 mb-1">
                  How it works
                </p>
                <textarea
                  value={generated.explanation || ''}
                  onChange={(e) => updateGenerated('explanation', e.target.value)}
                  rows={3}
                  className="w-full bg-transparent text-sm text-slate-600 outline-none resize-y"
                />
              </div>

              {generated.letterMapping && (
                <div>
                  <p className="text-xs font-bold text-slate-700 mb-2">
                    Letter mapping
                  </p>
                  <pre className="text-xs whitespace-pre-wrap bg-white rounded-lg p-3 border border-slate-200 text-slate-600">
                    {typeof generated.letterMapping === 'string'
                      ? generated.letterMapping
                      : JSON.stringify(generated.letterMapping, null, 2)}
                  </pre>
                </div>
              )}

              <div>
                <p className="text-xs font-bold text-slate-700 mb-1">
                  Original concept
                </p>
                <p className="text-sm text-slate-600">
                  {generated.originalConcept}
                </p>
              </div>

              {generated.example && (
                <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
                  <p className="text-xs font-bold text-amber-800 mb-1">
                    Example
                  </p>
                  <p className="text-sm text-amber-900">
                    {generated.example}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="h-56 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-2xl bg-violet-100 text-violet-600 flex items-center justify-center mb-3">
                <Lightbulb className="w-7 h-7" />
              </div>
              <p className="text-sm font-semibold text-slate-700">
                Your mnemonic will appear here
              </p>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Generate a memory trick and review it before saving it to your library.
              </p>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
          {message}
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-slate-900">Saved mnemonics</h3>
            <p className="text-xs text-slate-500 mt-1">
              Your personal collection for this subject.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search mnemonics..."
                className="pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:border-violet-400"
              />
            </div>
            <button
              type="button"
              onClick={fetchSavedMnemonics}
              className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {filteredMnemonics.length === 0 ? (
          <div className="py-10 text-center">
            <Brain className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-slate-600">
              No saved mnemonics yet
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Your saved memory tricks will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredMnemonics.map((item) => (
              <div
                key={item._id}
                className="border border-slate-200 rounded-xl p-4 hover:border-violet-200 transition-colors"
              >
                <div className="flex justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm text-slate-800 truncate">
                      {item.title}
                    </h4>
                    <p className="text-[11px] text-violet-600 mt-1">
                      {item.topic} · {techniques.find((t) => t.value === item.technique)?.label || item.technique}
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
                <p className="text-sm text-slate-700 mt-3 whitespace-pre-wrap line-clamp-4">
                  {item.mnemonic}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default MnemonicGenerator;
