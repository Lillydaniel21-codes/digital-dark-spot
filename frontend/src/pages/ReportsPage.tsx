import React, { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Printer,
  Shield,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ListChecks,
  ExternalLink,
  Bot
} from 'lucide-react';
import { api } from '../services/api';
import { ResearchProject } from '../types';
import { EvidenceBadge } from '../components/EvidenceBadge';
import { CategoryBadge } from '../components/CategoryBadge';

interface ReportsPageProps {
  project: ResearchProject;
  onOpenAssistant: () => void;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({
  project,
  onOpenAssistant,
}) => {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await api.getReport(project.id);
        setReport(data);
      } catch (err: any) {
        setError(err.message || 'Failed to compile research report.');
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [project.id]);

  const handleDownloadPdf = async () => {
    try {
      setDownloading(true);
      await api.downloadPdfReport(project.id, project.title);
    } catch (err: any) {
      alert(err.message || 'Failed to download PDF report.');
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadCsv = async () => {
    try {
      setDownloadingCsv(true);
      await api.downloadCsvReport(project.id, project.title);
    } catch (err: any) {
      alert(err.message || 'Failed to download CSV report.');
    } finally {
      setDownloadingCsv(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-20 text-center text-slate-400 text-xs">
        Compiling comprehensive research report...
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="py-16 text-center max-w-md mx-auto bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <h3 className="text-sm font-bold text-white mb-1">Report Compilation Incomplete</h3>
        <p className="text-xs text-slate-400 mb-4">{error || 'Please run research analysis first.'}</p>
      </div>
    );
  }

  const analysis = report.analysis || {};
  const sources = report.sources || [];
  const checklist = report.checklist || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Action Bar (hidden when printing) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-semibold mb-2">
            <FileText className="w-3.5 h-3.5" /> Formal Research Audit Document
          </div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Comprehensive Research Report
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Official traceable report generated from database records.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onOpenAssistant}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Bot className="w-4 h-4 text-indigo-400" />
            <span>Ask Assistant</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-200 text-xs font-semibold transition-colors flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-400" />
            <span>Print</span>
          </button>

          <button
            onClick={handleDownloadCsv}
            disabled={downloadingCsv}
            className="px-3.5 py-2 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-300 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloadingCsv ? 'Exporting...' : 'Export CSV'}</span>
          </button>

          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-bold shadow-lg shadow-indigo-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <Download className="w-4 h-4" />
            <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
          </button>
        </div>
      </div>

      {/* Printable Report Document Sheet */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-10 space-y-8 shadow-2xl">
        {/* Document Header */}
        <div className="border-b border-slate-800 pb-6 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" />
              <span className="font-bold text-sm tracking-wider uppercase text-indigo-400 font-mono">
                Digital Dark Spot Intelligence
              </span>
            </div>
            <span className="text-xs font-mono text-slate-500">
              Audit ID: {project.id.slice(0, 8)}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {project.title}
          </h2>

          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs text-slate-300">
            <span className="font-bold text-slate-400 block mb-0.5">Core Research Question:</span>
            "{project.research_question}"
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-500 pt-1">
            <span>Domain: {project.topic}</span>
            <span>•</span>
            <span>Generated: {new Date(report.created_at).toLocaleDateString()}</span>
            <span>•</span>
            <span>Status: {project.status.toUpperCase()}</span>
          </div>
        </div>

        {/* 1. Executive Summary */}
        <div className="space-y-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
            1. Executive Summary
          </h3>
          <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
            {analysis.executive_summary || 'No summary registered.'}
          </p>
        </div>

        {/* 2. Sources Reviewed */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold">
            2. Sources Reviewed ({sources.length})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border border-slate-800 rounded-xl overflow-hidden">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-mono">
                <tr>
                  <th className="p-2.5">Citation</th>
                  <th className="p-2.5">Source Title</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Publication Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300 font-mono">
                {sources.map((s: any, i: number) => (
                  <tr key={i} className="hover:bg-slate-850/50">
                    <td className="p-2.5 font-bold text-indigo-300">{s.citation_id}</td>
                    <td className="p-2.5 font-sans font-medium text-white">{s.title}</td>
                    <td className="p-2.5 uppercase text-[11px]">{s.source_type}</td>
                    <td className="p-2.5 text-slate-400">{s.publication_date || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3. Key Findings */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
            3. Key Verified Findings
          </h3>
          <div className="space-y-2">
            {analysis.findings?.map((f: any, i: number) => (
              <div key={i} className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{f.title}</span>
                  <EvidenceBadge strength={f.evidence_strength} />
                </div>
                <p className="text-slate-300 leading-relaxed">{f.explanation}</p>
                <div className="text-[11px] text-slate-400 font-mono pt-1">
                  Evidence: {f.supporting_evidence} [{f.citation_ids}]
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Information Gaps */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-rose-400 font-bold">
            4. Detected Information Gaps
          </h3>
          <div className="space-y-3">
            {analysis.gaps?.map((g: any, i: number) => (
              <div key={i} className="p-4 rounded-xl bg-slate-950/80 border border-rose-500/30 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">[{g.category}] {g.title}</span>
                  <CategoryBadge status={g.status} />
                </div>
                <p className="text-slate-300">{g.explanation}</p>
                <p className="text-slate-400 text-[11px]"><span className="text-slate-300 font-semibold">Impact:</span> {g.why_it_matters}</p>
                <div className="text-indigo-400 text-[11px] font-mono">
                  Action: {g.suggested_next_step}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Conflicting Claims */}
        {analysis.conflicts?.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-amber-400 font-bold">
              5. Conflicting Claims Across Sources
            </h3>
            <div className="space-y-3">
              {analysis.conflicts.map((c: any, i: number) => (
                <div key={i} className="p-4 rounded-xl bg-slate-950/80 border border-amber-500/30 text-xs space-y-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="font-bold text-indigo-300 block mb-1">Claim A [{c.source_a_citation}]:</span>
                      {c.claim_a}
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <span className="font-bold text-violet-300 block mb-1">Claim B [{c.source_b_citation}]:</span>
                      {c.claim_b}
                    </div>
                  </div>
                  <p className="text-slate-300 text-xs">{c.explanation}</p>
                  <p className="text-amber-400 font-medium text-xs">Verify: {c.what_to_verify}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 6. Verification Checklist */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold">
            6. Prioritized Verification Checklist
          </h3>
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 space-y-2">
            {checklist.map((item: any, i: number) => (
              <div key={i} className="flex items-start gap-2.5 text-xs text-slate-300">
                <span className="font-mono text-emerald-400 font-bold">
                  {item.is_completed ? '[X]' : '[ ]'}
                </span>
                <div>
                  <span className="font-bold text-white">{i + 1}. {item.title}</span>
                  <span className="text-[10px] text-slate-500 ml-2 font-mono uppercase">({item.priority} Priority)</span>
                  <p className="text-slate-400 text-[11px]">{item.why_it_matters}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 7. Limitations */}
        <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-500 font-mono leading-relaxed">
          <span className="text-slate-400 font-semibold block mb-1">Audit Limitations & Verification Standard:</span>
          {analysis.limitations}
        </div>
      </div>
    </div>
  );
};
