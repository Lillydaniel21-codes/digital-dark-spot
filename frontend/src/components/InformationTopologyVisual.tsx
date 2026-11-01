import React from 'react';
import { Shield, Sparkles, AlertCircle, Database, CheckCircle2, ArrowRight } from 'lucide-react';

export const InformationTopologyVisual: React.FC = () => {
  return (
    <div className="w-full bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
        <div className="space-y-3 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" /> Information Topology & Dark Spot Radar
          </div>
          <h3 className="text-xl font-bold text-white tracking-tight">
            Multi-Source Triangulation & Blind Spot Exposure
          </h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            The platform projects claim vectors from each source across expected domain categories. Where source coverage intersects with unstated conditions, a <strong>Digital Dark Spot</strong> is flagged for targeted verification before commitments are made.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-400 pt-1">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
              <span>Corroborated Facts</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
              <span>Conflicting Claims</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Dark Spot (Missing Info)</span>
            </div>
          </div>
        </div>

        {/* Visual Architectural Vector SVG */}
        <div className="w-full md:w-80 h-52 bg-slate-950/80 border border-slate-800 rounded-xl p-3 flex items-center justify-center relative overflow-hidden shadow-inner">
          <svg viewBox="0 0 320 200" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Background radar concentric rings */}
            <circle cx="160" cy="100" r="80" stroke="#1e293b" strokeWidth="1" strokeDasharray="3 3" />
            <circle cx="160" cy="100" r="55" stroke="#334155" strokeWidth="1" />
            <circle cx="160" cy="100" r="30" stroke="#475569" strokeWidth="1" strokeDasharray="2 2" />

            {/* Radar scan beam */}
            <path d="M160 100 L230 45 A80 80 0 0 0 160 20 Z" fill="url(#radarGradient)" opacity="0.3" />

            {/* Source Nodes */}
            {/* SRC-001 */}
            <line x1="70" y1="50" x2="160" y2="100" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 2" />
            <circle cx="70" cy="50" r="14" fill="#1e1b4b" stroke="#6366f1" strokeWidth="2" />
            <text x="70" y="53" textAnchor="middle" fill="#c7d2fe" fontSize="8" fontFamily="monospace" fontWeight="bold">SRC-1</text>

            {/* SRC-002 */}
            <line x1="250" y1="60" x2="160" y2="100" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4 2" />
            <circle cx="250" cy="60" r="14" fill="#2e1065" stroke="#8b5cf6" strokeWidth="2" />
            <text x="250" y="63" textAnchor="middle" fill="#ddd6fe" fontSize="8" fontFamily="monospace" fontWeight="bold">SRC-2</text>

            {/* SRC-003 */}
            <line x1="90" y1="160" x2="160" y2="100" stroke="#06b6d4" strokeWidth="1.5" strokeDasharray="4 2" />
            <circle cx="90" cy="160" r="14" fill="#083344" stroke="#06b6d4" strokeWidth="2" />
            <text x="90" y="163" textAnchor="middle" fill="#cffafe" fontSize="8" fontFamily="monospace" fontWeight="bold">SRC-3</text>

            {/* Central Dark Spot Node (The Missing Gap) */}
            <circle cx="160" cy="100" r="18" fill="#4c0519" stroke="#f43f5e" strokeWidth="2" />
            <circle cx="160" cy="100" r="24" stroke="#f43f5e" strokeWidth="1" opacity="0.4" className="animate-ping" />
            <text x="160" y="98" textAnchor="middle" fill="#ffe4e6" fontSize="7" fontFamily="sans-serif" fontWeight="bold">DARK SPOT</text>
            <text x="160" y="108" textAnchor="middle" fill="#fda4af" fontSize="6.5" fontFamily="monospace">GAP DETECTED</text>

            {/* Gradients */}
            <defs>
              <linearGradient id="radarGradient" x1="160" y1="100" x2="230" y2="45" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6366f1" stopOpacity="0.8" />
                <stop offset="1" stopColor="#6366f1" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </div>
  );
};
