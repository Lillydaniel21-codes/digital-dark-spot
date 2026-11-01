import React, { useState, useEffect } from 'react';
import {
  Database,
  PlusCircle,
  FileText,
  Link as LinkIcon,
  Trash2,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  Clock,
  Eye,
  Play,
  Upload,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { ResearchProject, Source } from '../types';

interface SourcesPageProps {
  project: ResearchProject;
  onRunAnalysis: () => void;
}

export const SourcesPage: React.FC<SourcesPageProps> = ({
  project,
  onRunAnalysis,
}) => {
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Add source inputs
  const [showAddUrl, setShowAddUrl] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [newUrlTitle, setNewUrlTitle] = useState('');
  const [addingUrl, setAddingUrl] = useState(false);

  // Preview modal
  const [previewSource, setPreviewSource] = useState<Source | null>(null);

  const fetchSources = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getSources(project.id);
      setSources(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sources.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSources();
  }, [project.id]);

  const handleAddUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl.trim()) return;

    setAddingUrl(true);
    setError(null);
    try {
      await api.addUrlSource(project.id, newUrl.trim(), newUrlTitle.trim());
      setNewUrl('');
      setNewUrlTitle('');
      setShowAddUrl(false);
      fetchSources();
    } catch (err: any) {
      setError(err.message || 'Failed to add URL source.');
    } finally {
      setAddingUrl(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    try {
      setLoading(true);
      await api.uploadDocumentSource(project.id, file);
      fetchSources();
    } catch (err: any) {
      setError(err.message || 'Failed to upload document.');
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Remove this source and its extracted chunks?')) return;
    try {
      await api.deleteSource(id);
      fetchSources();
    } catch (err: any) {
      setError(err.message || 'Failed to delete source.');
    }
  };

  const readySources = sources.filter((s) => s.status === 'ready');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold mb-2">
            <Database className="w-3.5 h-3.5" /> Source Registry & Evidence Vault
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Source Management & Extraction
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Sources registered for: <span className="text-slate-200 font-semibold">{project.title}</span>
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowAddUrl(!showAddUrl)}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <LinkIcon className="w-4 h-4 text-indigo-400" />
            <span>Add URL</span>
          </button>

          <label className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer">
            <Upload className="w-4 h-4 text-violet-400" />
            <span>Upload Document</span>
            <input
              type="file"
              accept=".pdf,.docx,.txt"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>

          <button
            onClick={onRunAnalysis}
            disabled={readySources.length === 0}
            className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Run Gap Analysis ({readySources.length})</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Add URL Drawer */}
      {showAddUrl && (
        <form onSubmit={handleAddUrl} className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
              Add Webpage Source (with SSRF Guard)
            </h3>
            <button
              type="button"
              onClick={() => setShowAddUrl(false)}
              className="text-slate-500 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="url"
              required
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              placeholder="https://example.org/guidelines"
              className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
            <input
              type="text"
              value={newUrlTitle}
              onChange={(e) => setNewUrlTitle(e.target.value)}
              placeholder="Source Title (optional)"
              className="px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddUrl(false)}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={addingUrl}
              className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {addingUrl ? 'Extracting...' : 'Add & Extract'}
            </button>
          </div>
        </form>
      )}

      {/* Sources List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white">Registered Sources ({sources.length})</h3>
          <span className="text-xs text-slate-400">
            {readySources.length} ready for gap evaluation
          </span>
        </div>

        {loading ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            Loading sources...
          </div>
        ) : sources.length === 0 ? (
          <div className="p-12 text-center">
            <Database className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-xs mb-3">No sources added yet.</p>
            <p className="text-slate-500 text-[11px] max-w-sm mx-auto">
              Add URLs or upload PDF/DOCX documents to begin analyzing information gaps and contradictions.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {sources.map((src) => (
              <div
                key={src.id}
                className="p-5 hover:bg-slate-850/60 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2 py-0.5 rounded font-mono text-[11px] font-bold bg-indigo-950/80 border border-indigo-500/40 text-indigo-300">
                      {src.citation_id}
                    </span>
                    <h4 className="text-sm font-bold text-white truncate max-w-md">
                      {src.title}
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase bg-slate-800 text-slate-300">
                      {src.source_type}
                    </span>

                    {/* Status Badge */}
                    {src.status === 'ready' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> Ready
                      </span>
                    )}
                    {src.status === 'processing' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
                        <Clock className="w-3 h-3 animate-spin" /> Processing
                      </span>
                    )}
                    {src.status === 'failed' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30">
                        <AlertCircle className="w-3 h-3" /> Failed
                      </span>
                    )}
                  </div>

                  {src.original_url && (
                    <div className="flex items-center gap-1.5 text-xs text-indigo-400 font-mono">
                      <ExternalLink className="w-3 h-3" />
                      <a href={src.original_url} target="_blank" rel="noreferrer" className="hover:underline truncate max-w-lg">
                        {src.original_url}
                      </a>
                    </div>
                  )}

                  {src.extracted_summary && (
                    <p className="text-xs text-slate-400 line-clamp-2 italic pt-1">
                      "{src.extracted_summary}"
                    </p>
                  )}

                  {src.error_message && (
                    <p className="text-xs text-rose-400 pt-1 font-medium">
                      Error: {src.error_message}
                    </p>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
                    <span>Published: {src.publication_date || 'Undated'}</span>
                    <span>•</span>
                    <span>Collected: {new Date(src.collected_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  {src.extracted_summary && (
                    <button
                      onClick={() => setPreviewSource(src)}
                      className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Preview</span>
                    </button>
                  )}

                  <button
                    onClick={() => handleDelete(src.id)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Remove Source"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {previewSource && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded font-mono text-xs bg-indigo-500/20 text-indigo-300 font-bold">
                  {previewSource.citation_id}
                </span>
                <h3 className="text-base font-bold text-white truncate max-w-md">
                  {previewSource.title}
                </h3>
              </div>
              <button
                onClick={() => setPreviewSource(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-2 text-xs text-slate-300 leading-relaxed font-mono whitespace-pre-wrap bg-slate-900/80 p-4 rounded-xl border border-slate-800">
              {previewSource.extracted_summary}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setPreviewSource(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
