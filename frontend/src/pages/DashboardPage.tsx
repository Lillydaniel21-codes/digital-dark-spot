import React, { useState, useEffect } from 'react';
import {
  Compass,
  PlusCircle,
  Sparkles,
  Database,
  AlertTriangle,
  Clock,
  ArrowRight,
  Bot,
  FileText,
  Trash2,
  Layers,
  Search,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { DashboardSummary, ResearchProject } from '../types';
import { SmartSearchBar } from '../components/SmartSearchBar';
import { DomainGrid, DomainItem } from '../components/DomainGrid';
import { InformationTopologyVisual } from '../components/InformationTopologyVisual';

interface DashboardPageProps {
  onNavigate: (tab: string, projectId?: string, initialData?: any) => void;
  onOpenSample: (domain?: string) => void;
}

const BENCHMARK_SAMPLES = [
  { domain: 'agriculture', label: 'PM-KUSUM Solar Pump', tag: 'Agriculture' },
  { domain: 'healthcare', label: 'Telemedicine Schedule X', tag: 'Healthcare' },
  { domain: 'environment', label: 'Flood Runoff Defenses', tag: 'Environment' },
  { domain: 'employment', label: 'Cross-Border Remote IP', tag: 'Employment' },
  { domain: 'education', label: 'Global STEM Fellowship', tag: 'Education' },
];

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onNavigate,
  onOpenSample,
}) => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadingBenchmark, setLoadingBenchmark] = useState<string | null>(null);

  const fetchSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getDashboardSummary();
      setSummary(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard metrics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleBenchmarkClick = async (domainKey: string) => {
    setLoadingBenchmark(domainKey);
    try {
      await onOpenSample(domainKey);
    } finally {
      setLoadingBenchmark(null);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm('Delete this research project and its analysis?')) return;
    try {
      await api.deleteResearch(id);
      fetchSummary();
    } catch (err: any) {
      alert(err.message || 'Failed to delete research project.');
    }
  };

  const handleSmartSearchSelect = (item: { query: string; domain?: string; title?: string }) => {
    onNavigate('new-research', undefined, {
      title: item.title || item.query,
      question: item.query,
      topic: item.domain || 'General & Custom Topics',
    });
  };

  const handleDomainSelect = (domain: DomainItem, sampleTopic?: string) => {
    onNavigate('new-research', undefined, {
      title: sampleTopic || `${domain.name} Information Audit`,
      question: sampleTopic || `What information is missing, conflicting, or unverified regarding ${domain.name}?`,
      topic: domain.name,
    });
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Compass className="w-3.5 h-3.5" /> Universal Information Gap Intelligence
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Research Intelligence Dashboard
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Detect hidden information gaps, conflicting claims, and unstated requirements across any real-world domain.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('new-research')}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Research Investigation</span>
          </button>
        </div>
      </div>

      {/* Hero Smart Search Bar (YouTube-style with live autocomplete, keyboard navigation & voice search) */}
      <div className="bg-gradient-to-b from-slate-900/90 via-slate-900/50 to-transparent p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl relative overflow-visible">
        <div className="text-center max-w-2xl mx-auto mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            What real-world question do you want to audit?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Search government schemes, agricultural subsidies, clinical rules, employment contracts, or enter any custom problem.
          </p>
        </div>

        {/* The YouTube-style search component */}
        <SmartSearchBar
          onSelectSearch={handleSmartSearchSelect}
          placeholder="Search any scheme, topic, contract term, or question..."
          showDomainFilter={true}
        />

        {/* 1-Click Multi-Domain Benchmark Switcher */}
        <div className="mt-6 pt-5 border-t border-slate-800/60 flex flex-col sm:flex-row items-center justify-center gap-3">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1.5 shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            Instant Benchmark Cases:
          </span>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {BENCHMARK_SAMPLES.map((bench) => (
              <button
                key={bench.domain}
                type="button"
                disabled={loadingBenchmark !== null}
                onClick={() => handleBenchmarkClick(bench.domain)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all flex items-center gap-1.5 ${
                  loadingBenchmark === bench.domain
                    ? 'bg-indigo-600/30 border-indigo-400 text-white animate-pulse'
                    : 'bg-slate-900/90 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white hover:border-indigo-500/50'
                }`}
              >
                <span>{bench.label}</span>
                <span className="text-[10px] text-indigo-400 font-semibold px-1.5 py-0.2 rounded bg-indigo-500/10 border border-indigo-500/20">
                  {bench.tag}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Research Projects
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            {loading ? '-' : summary?.total_projects || 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Active multi-source audits</span>
        </div>

        {/* Metric 2 */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Sources Ingested
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">
            {loading ? '-' : summary?.total_sources || 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">PDF, DOCX, TXT & URLs parsed</span>
        </div>

        {/* Metric 3 */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Information Gaps
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-rose-400">
            {loading ? '-' : summary?.total_gaps || 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Omissions & unstated rules</span>
        </div>

        {/* Metric 4 */}
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
              Conflicting Claims
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-amber-400">
            {loading ? '-' : summary?.total_conflicts || 0}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Contradictions & outdated data</span>
        </div>
      </div>

      {/* Architecture Visual Topology Component */}
      <InformationTopologyVisual />

      {/* Domain Selection Grid with Curated Imagery */}
      <div className="pt-2">
        <DomainGrid onSelectDomain={handleDomainSelect} />
      </div>

      {/* Recent Research Projects Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-400" />
            <h3 className="text-sm font-bold text-white">Recent Research Projects</h3>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
          >
            View All ({summary?.total_projects || 0})
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            Loading research records...
          </div>
        ) : !summary?.recent_projects || summary.recent_projects.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-slate-400 text-xs mb-3">No research projects yet.</p>
            <button
              onClick={() => handleBenchmarkClick('agriculture')}
              className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-500 transition-colors"
            >
              Load Agriculture Benchmark Case
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {summary.recent_projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => onNavigate('analysis', proj.id)}
                className="p-5 hover:bg-slate-850/60 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-white hover:text-indigo-300 transition-colors">
                      {proj.title}
                    </h4>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold uppercase ${
                      proj.status === 'analyzed'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}>
                      {proj.status}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                      {proj.topic}
                    </span>
                    {proj.location && (
                      <span className="text-[11px] text-cyan-400 font-mono">
                        📍 {proj.location}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1 italic">
                    "{proj.research_question}"
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500 font-mono pt-1">
                    <span>{proj.sources_count} sources</span>
                    <span>•</span>
                    <span>Created: {new Date(proj.created_at).toLocaleDateString()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('assistant', proj.id);
                    }}
                    className="p-2 rounded-lg bg-slate-800 hover:bg-indigo-600/20 text-slate-300 hover:text-indigo-300 transition-colors"
                    title="Open AI Research Assistant"
                  >
                    <Bot className="w-4 h-4" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate('reports', proj.id);
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
                    <ChevronRight className="w-4 h-4" />
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
