
import { useEffect, useRef, useState } from 'react';

import {
  diagramsAPI,
} from '../../services/api';
import {
  GitBranch,
  Sparkles,
  Save,
  Trash2,
  RefreshCw,
  Download,
  Search,
  Loader2,
  Eye,
  X,
  Network,
  FileCode,
} from 'lucide-react';



const diagramTypes = [
  { value: 'flowchart', label: 'Flowchart' },
  { value: 'concept-map', label: 'Concept Map' },
  { value: 'process', label: 'Process Diagram' },
  { value: 'hierarchical', label: 'Hierarchical Diagram' },
  { value: 'block-diagram', label: 'Block Diagram' },
  { value: 'step-by-step', label: 'Step-by-Step' },
];

const DiagramGenerator = ({ subjectId, selectedMaterial }) => {
  const [topic, setTopic] = useState('');
  const [diagramType, setDiagramType] = useState('flowchart');
  const [sourceText, setSourceText] = useState('');
  const [additionalInstructions, setAdditionalInstructions] = useState('');
  const [generated, setGenerated] = useState(null);
  const [savedDiagrams, setSavedDiagrams] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [renderError, setRenderError] = useState('');
  const [renderedSvg, setRenderedSvg] = useState('');
  const [selectedSaved, setSelectedSaved] = useState(null);

  const diagramRef = useRef(null);
  const renderCounter = useRef(0);

  const materialReady = selectedMaterial?.processingStatus === 'completed';

  const fetchSavedDiagrams = async () => {
    try {
      const response = await diagramsAPI.getAll({ subjectId });
      setSavedDiagrams(response.data.data || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load saved diagrams.');
    }
  };

  useEffect(() => {
    if (subjectId) fetchSavedDiagrams();
  }, [subjectId]);

  useEffect(() => {
  const renderDiagram = async () => {
    const source = selectedSaved?.diagramSource || generated?.diagramSource;

    if (!source) {
      setRenderedSvg('');
      setRenderError('');
      return;
    }

    const currentRender = ++renderCounter.current;

    try {
      const mermaidModule = await import('mermaid');
      const mermaid = mermaidModule.default;

      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'strict',
        flowchart: {
          useMaxWidth: true,
          htmlLabels: false,
          curve: 'basis',
        },
      });

      const id = `studypilot-diagram-${Date.now()}-${currentRender}`;
      const { svg } = await mermaid.render(id, source);

      if (currentRender === renderCounter.current) {
        setRenderedSvg(svg);
        setRenderError('');
      }
    } catch (err) {
      if (currentRender === renderCounter.current) {
        setRenderedSvg('');
        setRenderError('This diagram could not be rendered. Try regenerating it.');
      }
    }
  };

  renderDiagram();
}, [generated, selectedSaved]);

  useEffect(() => {
    if (diagramRef.current && renderedSvg) {
      diagramRef.current.innerHTML = renderedSvg;
    }
  }, [renderedSvg]);

  const handleGenerate = async () => {
    setError('');
    setSuccess('');
    setGenerated(null);
    setSelectedSaved(null);
    setRenderedSvg('');

    if (!topic.trim()) {
      setError('Please enter a topic.');
      return;
    }

    if (selectedMaterial && !materialReady) {
      setError('Please wait until the selected material has finished processing.');
      return;
    }

    if (!selectedMaterial && !sourceText.trim()) {
      setError('Please enter some study content to generate a diagram.');
      return;
    }

    setLoading(true);

    try {
      const payload = {
        subjectId,
        topic: topic.trim(),
        diagramType,
        additionalInstructions,
      };

      if (selectedMaterial?._id) {
        payload.materialId = selectedMaterial._id;
      } else {
        payload.sourceText = sourceText.trim();
      }

      const response = await diagramsAPI.generate(payload);
      setGenerated(response.data.data);
      setSuccess('Diagram generated successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Diagram generation failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!generated) return;

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      await diagramsAPI.save({
        subjectId,
        materialId: selectedMaterial?._id || null,
        ...generated,
      });

      setSuccess('Diagram saved successfully.');
      await fetchSavedDiagrams();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not save diagram.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this saved diagram?')) return;

    try {
      await diagramsAPI.delete(id);
      setSavedDiagrams((prev) => prev.filter((item) => item._id !== id));

      if (selectedSaved?._id === id) {
        setSelectedSaved(null);
      }

      setSuccess('Diagram deleted successfully.');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not delete diagram.');
    }
  };

  const handleViewSaved = (diagram) => {
    setSelectedSaved(diagram);
    setGenerated(null);
    setError('');
    setSuccess('');
  };

  const handleExportSource = () => {
    const source = selectedSaved?.diagramSource || generated?.diagramSource;
    if (!source) return;

    const blob = new Blob([source], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `${(generated?.title || selectedSaved?.title || 'diagram').replace(/[^a-z0-9-_]/gi, '_')}.mmd`;
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleExportSvg = () => {
    if (!renderedSvg) return;

    const blob = new Blob([renderedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = 'studypilot-diagram.svg';
    link.click();

    URL.revokeObjectURL(url);
  };

  const handleExportPng = () => {
    if (!renderedSvg) return;

    const svgBlob = new Blob([renderedSvg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const image = new Image();

    image.onload = () => {
      const canvas = document.createElement('canvas');
      const scale = 2;

      canvas.width = image.width * scale;
      canvas.height = image.height * scale;

      const context = canvas.getContext('2d');
      context.scale(scale, scale);
      context.drawImage(image, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;

        const pngUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');

        link.href = pngUrl;
        link.download = 'studypilot-diagram.png';
        link.click();

        URL.revokeObjectURL(pngUrl);
      }, 'image/png');

      URL.revokeObjectURL(url);
    };

    image.onerror = () => {
      URL.revokeObjectURL(url);
      setError('Could not export this diagram as PNG. Try SVG instead.');
    };

    image.src = url;
  };

  const activeDiagram = selectedSaved || generated;

  const filteredDiagrams = savedDiagrams.filter((diagram) =>
    `${diagram.title} ${diagram.topic}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
            <Network size={23} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              AI Diagram & Flowchart Generator
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Turn difficult concepts into visual diagrams.
            </p>
          </div>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
          AI Powered
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Topic
            </label>
            <input
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. Working of a Microprocessor"
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Diagram Type
            </label>
            <select
              value={diagramType}
              onChange={(e) => setDiagramType(e.target.value)}
              className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            >
              {diagramTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {selectedMaterial ? (
            <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-4 dark:border-indigo-900 dark:bg-indigo-950/30">
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
                <FileCode size={17} />
                Selected study material
              </div>
              <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">
                {selectedMaterial.title || selectedMaterial.originalName || 'Selected material'}
              </p>
              <p className="mt-1 text-xs text-gray-500">
                {materialReady
                  ? 'Processed content will be used as context.'
                  : 'This material is still being processed.'}
              </p>
            </div>
          ) : (
            <div>
              <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Study Content
              </label>
              <textarea
                value={sourceText}
                onChange={(e) => setSourceText(e.target.value)}
                rows={6}
                placeholder="Paste your notes, textbook content, or concept explanation here..."
                className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Additional Instructions (Optional)
            </label>
            <textarea
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              rows={2}
              placeholder="e.g. Keep it simple and suitable for exam revision."
              className="w-full resize-y rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? <Loader2 className="animate-spin" size={19} /> : <Sparkles size={19} />}
            {loading ? 'Generating Diagram...' : 'Generate Diagram'}
          </button>
        </div>

        <div className="min-w-0 rounded-2xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800/50">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold text-gray-900 dark:text-white">
              Diagram Preview
            </h3>

            {activeDiagram && (
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleExportSource}
                  title="Export Mermaid source"
                  className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <FileCode size={17} />
                </button>
                <button
                  onClick={handleExportSvg}
                  title="Export SVG"
                  className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Download size={17} />
                  <span className="ml-1 text-xs">SVG</span>
                </button>
                <button
                  onClick={handleExportPng}
                  title="Export PNG"
                  className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
                >
                  <Download size={17} />
                  <span className="ml-1 text-xs">PNG</span>
                </button>
              </div>
            )}
          </div>

          {!activeDiagram && (
            <div className="flex min-h-72 flex-col items-center justify-center text-center">
              <div className="mb-4 rounded-2xl bg-indigo-100 p-5 text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                <GitBranch size={35} />
              </div>
              <p className="font-semibold text-gray-700 dark:text-gray-200">
                Your diagram will appear here
              </p>
              <p className="mt-2 max-w-xs text-sm text-gray-500">
                Enter a topic and study content to create your first visual explanation.
              </p>
            </div>
          )}

          {activeDiagram && (
            <>
              <h4 className="mb-1 font-semibold text-gray-900 dark:text-white">
                {activeDiagram.title}
              </h4>
              <p className="mb-4 text-xs text-gray-500">
                {activeDiagram.topic} · {activeDiagram.diagramType}
              </p>

              {renderError ? (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
                  {renderError}
                </div>
              ) : (
                <div
                  ref={diagramRef}
                  className="min-h-48 overflow-auto rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700"
                />
              )}

              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-gray-600 dark:text-gray-300">
                {activeDiagram.explanation}
              </p>

              {generated && !selectedSaved && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  {saving ? 'Saving...' : 'Save Diagram'}
                </button>
              )}

              {selectedSaved && (
                <button
                  onClick={() => setSelectedSaved(null)}
                  className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                >
                  <X size={17} />
                  Close Saved Diagram
                </button>
              )}
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
          {success}
        </div>
      )}

      <div className="mt-8 border-t border-gray-200 pt-6 dark:border-gray-700">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">
              Saved Diagrams
            </h3>
            <p className="text-xs text-gray-500">
              Your diagrams for this subject.
            </p>
          </div>

          <button
            onClick={fetchSavedDiagrams}
            className="rounded-lg border border-gray-300 p-2 text-gray-600 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
            title="Refresh saved diagrams"
          >
            <RefreshCw size={17} />
          </button>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={17} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saved diagrams..."
            className="w-full rounded-xl border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-indigo-500 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          />
        </div>

        {filteredDiagrams.length === 0 ? (
          <p className="rounded-xl bg-gray-50 p-5 text-center text-sm text-gray-500 dark:bg-gray-800">
            No saved diagrams found.
          </p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filteredDiagrams.map((diagram) => (
              <div
                key={diagram._id}
                className="flex items-center justify-between gap-3 rounded-xl border border-gray-200 p-4 transition hover:border-indigo-300 hover:shadow-sm dark:border-gray-700 dark:hover:border-indigo-700"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold text-gray-900 dark:text-white">
                    {diagram.title}
                  </p>
                  <p className="mt-1 truncate text-xs text-gray-500">
                    {diagram.topic} · {diagram.diagramType}
                  </p>
                </div>

                <div className="flex shrink-0 gap-1">
                  <button
                    onClick={() => handleViewSaved(diagram)}
                    title="View diagram"
                    className="rounded-lg p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
                  >
                    <Eye size={17} />
                  </button>
                  <button
                    onClick={() => handleDelete(diagram._id)}
                    title="Delete diagram"
                    className="rounded-lg p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30"
                  >
                    <Trash2 size={17} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default DiagramGenerator;
