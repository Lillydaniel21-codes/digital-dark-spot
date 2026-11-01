import React, { useState, useEffect } from 'react';
import {
  History,
  Search,
  PlusCircle,
  FileText,
  Bot,
  Trash2,
  ArrowRight,
  Database,
  Layers,
  Sparkles
} from 'lucide-react';
import { api } from '../services/api';
import { ResearchProject } from '../types';

interface HistoryPageProps {
  onSelectProject: (projectId: string, tab: string) => void;
  onOpenSample: () => void;
}

export const HistoryPage: React.FC<HistoryPageProps> = ({
  onSelectProject,
  onOpenSample,
}) => {
  const [projects, setProjects] = useState<ResearchProject[]>([]);
  const [search, setSearch] = useState('');
  const [filterTopic, setFilterTopic] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.listResearch();
      setProjects(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch research history.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Delete this research project?')) return;
    try {
      await api.deleteResearch(id);
      fetchProjects();
    } catch (err: any) {
      alert(err.message || 'Failed to delete research project.');
    }
  };

  const filtered = projects.filter((p) => {
    const matchSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.research_question.toLowerCase().includes(search.toLowerCase());
    const matchTopic = filterTopic === 'All' || p.topic === filterTopic;
    return matchSearch && matchTopic;
  });

  const topics = ['All', ...Array.from(new Set(projects.map((p) => p.topic).filter(Boolean)))];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-2">
            <History className="w-3.5 h-3.5" /> Investigation Archive
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Research History & Audits
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Access previous research projects, review detected gaps, and continue chatbot inquiries.
          </p>
        </div>

        <button
          onClick={onOpenSample}
          className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-indigo-300 text-xs font-semibold transition-colors flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>Load Sample Benchmark</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or research question..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        <div className="w-full sm:w-auto overflow-x-auto flex items-center gap-2">
          {topics.map((t) => (
            <button
              key={t}
              onClick={() => setFilterTopic(t)}
              className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                filterTopic === t
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Projects List */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        {loading ? (
          <div className="p-12 text-center text-slate-400 text-xs">
            Loading research archive...
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Layers className="w-8 h-8 text-slate-600 mx-auto mb-2" />
            <p className="text-slate-400 text-xs mb-3">No matching research investigations found.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filtered.map((proj) => (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj.id, 'analysis')}
                className="p-5 hover:bg-slate-850/60 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-bold text-white hover:text-indigo-300 transition-colors truncate max-w-lg">
                      {proj.title}
                    </h3>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                      proj.status === 'analyzed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {proj.status}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {proj.topic}
                    </span>
                    {proj.location && (
                      <span className="text-[11px] text-cyan-400 font-mono">
                        📍 {proj.location}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 italic">
                    "{proj.research_question}"
                  </p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 font-mono pt-1">
                    <span>{proj.sources_count} sources recorded</span>
                    <span>•</span>
                    <span>Created {new Date(proj.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(proj.id, 'assistant');
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 transition-colors"
                    title="Open AI Research Assistant"
                  >
                    <Bot className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectProject(proj.id, 'reports');
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-violet-600/20 text-slate-300 hover:text-violet-300 transition-colors"
                    title="View Report"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => handleDelete(e, proj.id)}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete Project"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <div className="text-slate-500 pl-2">
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
