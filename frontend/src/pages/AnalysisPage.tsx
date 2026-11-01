import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ListChecks,
  Bot,
  FileText,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Sparkles,
  RefreshCw,
  CheckSquare,
  Square
} from 'lucide-react';
import { api } from '../services/api';
import { Analysis, ResearchProject, ChecklistItem } from '../types';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { CategoryBadge } from '../components/CategoryBadge';

interface AnalysisPageProps {
  project: ResearchProject;
  onOpenAssistant: () => void;
  onOpenReport: () => void;
}

export const AnalysisPage: React.FC<AnalysisPageProps> = ({
  project,
  onOpenAssistant,
  onOpenReport,
}) => {
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [reanalyzing, setReanalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await api.getAnalysis(project.id);
      setAnalysis(data);
      setChecklist(data.checklist || []);
    } catch (err: any) {
      setError(err.message || 'No analysis available yet.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalysis();
  }, [project.id]);

  const handleReanalyze = async () => {
    try {
      setReanalyzing(true);
      setError(null);
      const data = await api.runAnalysis(project.id);
      setAnalysis(data);
      setChecklist(data.checklist || []);
    } catch (err: any) {
      setError(err.message || 'Analysis execution failed.');
    } finally {
      setReanalyzing(false);
    }
  };

  const handleToggleChecklist = async (item: ChecklistItem) => {
    const updatedStatus = !item.is_completed;
    // Optimistic update
    setChecklist((prev) =>
      prev.map((c) => (c.id === item.id ? { ...c, is_completed: updatedStatus } : c))
    );

    try {
      await api.updateChecklistItem(item.id, updatedStatus);
    } catch (err) {
      // Revert if error
      setChecklist((prev) =>
        prev.map((c) => (c.id === item.id ? { ...c, is_completed: !updatedStatus } : c))
      );
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-4 max-w-md mx-auto">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
          <RefreshCw className="w-6 h-6 animate-spin" />
        </div>
        <h3 className="text-base font-bold text-white">Synthesizing Information Gaps</h3>
        <p className="text-xs text-slate-400">
          Comparing source materials, checking domain expectations, and detecting contradictions...
        </p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="py-16 text-center max-w-lg mx-auto bg-slate-900/60 border border-slate-800 rounded-2xl p-8">
        <AlertTriangle className="w-10 h-10 text-amber-400 mx-auto mb-3" />
        <h3 className="text-base font-bold text-white mb-2">No Analysis Found</h3>
        <p className="text-xs text-slate-400 mb-6">
          {error || 'This research project has not been analyzed yet. Run the gap detection pipeline to generate findings and detect missing information.'}
        </p>
        <button
          onClick={handleReanalyze}
          disabled={reanalyzing}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 mx-auto"
        >
          {reanalyzing ? (
            <span>Running Pipeline...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Run Gap Detection Now</span>
            </>
          )}
        </button>
      </div>
    );
  }

  const completedCount = checklist.filter((c) => c.is_completed).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Header & Global Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Pipeline Completed
            </span>
            {analysis.is_demo && (
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 uppercase">
                Demo Analysis Mode
              </span>
            )}
            <span className="text-xs text-slate-500 font-mono">
              Evaluated {new Date(analysis.created_at).toLocaleDateString()}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {project.title}
          </h1>
          <p className="text-slate-400 text-sm mt-1 italic">
            Inquiry: "{project.research_question}"
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenAssistant}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-1.5"
          >
            <Bot className="w-4 h-4" />
            <span>AI Research Assistant</span>
          </button>

          <button
            onClick={onOpenReport}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-all flex items-center gap-1.5"
          >
            <FileText className="w-4 h-4 text-violet-400" />
            <span>View Full Report</span>
          </button>

          <button
            onClick={handleReanalyze}
            disabled={reanalyzing}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Re-run Pipeline"
          >
            <RefreshCw className={`w-4 h-4 ${reanalyzing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Clinical Disclaimer Banner for Healthcare */}
      {(project.topic.toLowerCase().includes('health') || project.topic.toLowerCase().includes('wellbeing')) && (
        <div className="p-4 rounded-2xl bg-rose-950/50 border border-rose-800/60 flex items-start gap-3 shadow-lg">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-200 leading-relaxed">
            <strong className="text-sm font-bold text-rose-300 block mb-0.5">Important Medical & Clinical Notice:</strong>
            Information gap analysis on health, clinical protocols, pharmaceuticals, or health insurance terms is strictly for informational and research verification purposes. It is not medical advice and cannot substitute for guidance from qualified medical practitioners or authorized public health bodies.
          </div>
        </div>
      )}

      {/* 1. Executive Summary */}
      <section className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border border-indigo-500/30 shadow-xl">
        <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-bold uppercase tracking-wider mb-2">
          <Sparkles className="w-4 h-4" />
          <span>1. Executive Summary</span>
        </div>
        <p className="text-slate-200 text-sm leading-relaxed">
          {analysis.executive_summary}
        </p>
      </section>

      {/* 2. Key Findings */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">2. Key Verified Findings</h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            {analysis.findings?.length || 0} findings
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.findings?.map((f, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-all space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="text-sm font-bold text-white leading-snug">{f.title}</h3>
                <EvidenceBadge strength={f.evidence_strength} />
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{f.explanation}</p>
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <span className="text-slate-400 italic">{f.supporting_evidence}</span>
                <span className="px-2 py-0.5 rounded font-mono font-bold bg-slate-800 text-indigo-300">
                  {f.citation_ids}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Information Gaps */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              3. Detected Information Gaps (Missing Details)
            </h2>
          </div>
          <span className="text-xs text-rose-400 font-mono font-semibold">
            {analysis.gaps?.length || 0} gaps detected
          </span>
        </div>

        <div className="space-y-4">
          {analysis.gaps?.map((g, idx) => (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-slate-900/90 border border-rose-500/30 hover:border-rose-500/50 transition-all space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400">
                    [{g.category}]
                  </span>
                  <h3 className="text-sm font-bold text-white">{g.title}</h3>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    g.priority === 'High'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    Priority: {g.priority}
                  </span>
                  <CategoryBadge status={g.status} />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-400 block mb-1">Explanation:</span>
                  <p className="text-slate-300 leading-relaxed">{g.explanation}</p>
                </div>
                <div>
                  <span className="font-semibold text-slate-400 block mb-1">Why It Matters:</span>
                  <p className="text-slate-300 leading-relaxed">{g.why_it_matters}</p>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                <div className="text-slate-400">
                  <span className="font-semibold text-indigo-400">Suggested Action:</span> {g.suggested_next_step}
                </div>
                <div className="text-[11px] text-slate-500 font-mono shrink-0">
                  Reviewed: {g.sources_reviewed}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Conflicting Claims */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">4. Conflicting Claims Across Sources</h2>
          </div>
          <span className="text-xs text-amber-400 font-mono font-semibold">
            {analysis.conflicts?.length || 0} contradictions
          </span>
        </div>

        {analysis.conflicts?.length === 0 ? (
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-xs text-slate-400">
            No conflicting claims detected across the sources reviewed.
          </div>
        ) : (
          <div className="space-y-4">
            {analysis.conflicts?.map((c, idx) => (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-slate-900/90 border border-amber-500/30 hover:border-amber-500/50 transition-all space-y-4"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Claim A */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-indigo-400">
                        Claim A [{c.source_a_citation}]
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      "{c.claim_a}"
                    </p>
                  </div>

                  {/* Claim B */}
                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-violet-400">
                        Claim B [{c.source_b_citation}]
                      </span>
                    </div>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      "{c.claim_b}"
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
                  <div className="text-amber-300 font-medium leading-relaxed">
                    <span className="font-bold">Contradiction Analysis:</span> {c.explanation}
                  </div>
                  <div className="text-slate-400 text-[11px]">
                    <span className="font-semibold text-slate-300">Possible Reason:</span> {c.possible_reason}
                  </div>
                  <div className="text-slate-200 text-xs pt-1 border-t border-amber-500/20 font-medium">
                    <span className="text-amber-400 font-bold">What to Verify:</span> {c.what_to_verify}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 5. Potentially Outdated Information */}
      {analysis.outdated_warnings && analysis.outdated_warnings.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-violet-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              5. Potentially Outdated Information Warnings
            </h2>
          </div>

          <div className="space-y-3">
            {analysis.outdated_warnings.map((o, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded font-mono font-bold text-[11px] bg-violet-950/80 text-violet-300 border border-violet-500/30">
                    Source: {o.source_citation} (Published: {o.publication_date || 'N/A'})
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Collected: {new Date(o.collection_date).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-slate-200 font-medium">{o.flag_text}</p>
                <p className="text-slate-400 text-[11px] italic">
                  Reason for Warning: {o.reason}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* 6. Unanswered Questions */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">6. Critical Unanswered Questions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.unanswered_questions?.map((u, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 text-xs"
            >
              <h4 className="font-bold text-white leading-snug">{u.question}</h4>
              <p className="text-slate-400 text-[11px]">{u.importance}</p>
              {u.recommended_source && (
                <div className="pt-2 border-t border-slate-800 text-[11px] text-cyan-400 font-mono">
                  Recommended Source: {u.recommended_source}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 7. Prioritized Verification Checklist */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ListChecks className="w-4 h-4 text-emerald-400" />
            <h2 className="text-lg font-bold text-white tracking-tight">
              7. Prioritized Verification Checklist
            </h2>
          </div>
          <span className="text-xs font-mono text-emerald-400 font-semibold">
            {completedCount} of {checklist.length} verified
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 divide-y divide-slate-800">
          {checklist.map((item) => (
            <div
              key={item.id}
              onClick={() => handleToggleChecklist(item)}
              className="py-3.5 flex items-start gap-3.5 cursor-pointer hover:bg-slate-850/50 px-2 rounded-xl transition-colors group"
            >
              <button
                type="button"
                className="mt-0.5 text-slate-400 group-hover:text-emerald-400 transition-colors"
              >
                {item.is_completed ? (
                  <CheckSquare className="w-5 h-5 text-emerald-400" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>

              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-sm font-semibold ${
                      item.is_completed ? 'line-through text-slate-500' : 'text-white'
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className={`px-2 py-0.2 rounded text-[9px] font-mono font-bold uppercase ${
                    item.priority === 'High'
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  <span className="text-slate-500">Why it matters:</span> {item.why_it_matters}
                </p>
                {item.suggested_source && (
                  <span className="text-[11px] text-indigo-400 font-mono block">
                    Verify via: {item.suggested_source}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Limitations Disclaimer */}
      {analysis.limitations && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 text-[11px] text-slate-500 leading-relaxed font-mono">
          <span className="text-slate-400 font-semibold block mb-0.5">Methodological Disclaimer:</span>
          {analysis.limitations}
        </div>
      )}
    </div>
  );
};
