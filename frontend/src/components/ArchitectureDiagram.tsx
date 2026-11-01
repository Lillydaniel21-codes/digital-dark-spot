import React from 'react';
import { Layers, Search, Cpu, AlertTriangle, CheckCircle, Database, Bot, ArrowRight, ShieldCheck } from 'lucide-react';

export const ArchitectureDiagram: React.FC = () => {
  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-6 md:p-8 backdrop-blur-xl shadow-2xl relative overflow-hidden">
      {/* Background glow effects */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 mb-8 border-b border-slate-800 gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-950/70 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-2">
            <Cpu className="w-3.5 h-3.5 text-indigo-400" /> System Architecture & Engine Pipeline
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white tracking-tight">
            Digital Dark Spot Information Gap Detection Flow
          </h3>
          <p className="text-slate-400 text-sm mt-1">
            End-to-end multi-source analysis, contradiction resolution, and grounded research assistance.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start md:self-auto">
          <span className="flex h-2.5 w-2.5 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-mono text-emerald-400 font-medium">15-Step Active Pipeline</span>
        </div>
      </div>

      {/* Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {/* Step 1: Ingestion */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 hover:border-indigo-500/50 transition-all group">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-105 transition-transform">
            <Database className="w-5 h-5" />
          </div>
          <div className="text-xs font-mono text-blue-400 uppercase tracking-wider mb-1 font-semibold">Stage 01</div>
          <h4 className="text-white font-semibold text-base mb-2">Multi-Source Ingestion</h4>
          <p className="text-slate-400 text-xs leading-relaxed mb-3">
            Securely ingests live URLs with SSRF protection, alongside PDF, DOCX, and TXT files. Assigns unique citation IDs (e.g. <code className="text-blue-300 bg-blue-950/50 px-1 py-0.5 rounded">SRC-001</code>).
          </p>
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">PDF / DOCX</span>
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Web Scraper</span>
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">SSRF Guard</span>
          </div>
        </div>

        {/* Step 2: Normalization & Category Generation */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 hover:border-indigo-500/50 transition-all group">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-105 transition-transform">
            <Layers className="w-5 h-5" />
          </div>
          <div className="text-xs font-mono text-indigo-400 uppercase tracking-wider mb-1 font-semibold">Stage 02</div>
          <h4 className="text-white font-semibold text-base mb-2">Domain Category Engine</h4>
          <p className="text-slate-400 text-xs leading-relaxed mb-3">
            Normalizes text chunks and derives expected domain categories (e.g. Eligibility, Deadlines, Renewal Terms, Fee Schedule, Official Portal).
          </p>
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Chunk Matrix</span>
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Dynamic Taxonomy</span>
          </div>
        </div>

        {/* Step 3: Gap & Conflict Detection */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 hover:border-violet-500/50 transition-all group">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/30 flex items-center justify-center text-violet-400 mb-4 group-hover:scale-105 transition-transform">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs font-mono text-violet-400 uppercase tracking-wider mb-1 font-semibold">Stage 03</div>
          <h4 className="text-white font-semibold text-base mb-2">Dark Spot Synthesizer</h4>
          <p className="text-slate-400 text-xs leading-relaxed mb-3">
            Evaluates presence vs absence. Labels omissions as <span className="text-amber-300 font-medium">"Not found in sources reviewed"</span>, maps conflicting claims, and detects outdated cycle dates.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Contradictions</span>
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Outdated Warnings</span>
          </div>
        </div>

        {/* Step 4: Grounded Verification & Chat */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-5 hover:border-emerald-500/50 transition-all group">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-105 transition-transform">
            <Bot className="w-5 h-5" />
          </div>
          <div className="text-xs font-mono text-emerald-400 uppercase tracking-wider mb-1 font-semibold">Stage 04</div>
          <h4 className="text-white font-semibold text-base mb-2">AI Assistant & Action</h4>
          <p className="text-slate-400 text-xs leading-relaxed mb-3">
            Grounded retrieval assistant with explicit source citations. Generates prioritized verification checklists and printable PDF audit reports.
          </p>
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">Checklist</span>
            <span className="bg-slate-900 px-2 py-0.5 rounded border border-slate-800">ReportLab PDF</span>
          </div>
        </div>
      </div>

      {/* Architecture Highlights Footer */}
      <div className="mt-6 pt-5 border-t border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-400 gap-3">
        <div className="flex items-center gap-2 text-indigo-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Strict Grounding: No fabricated citations, unverified claims, or hallucinations.</span>
        </div>
        <div className="font-mono text-[11px] text-slate-500">
          FastAPI Backend • SQLAlchemy ORM • SQLite/PostgreSQL Ready • Vite React TS
        </div>
      </div>
    </div>
  );
};
