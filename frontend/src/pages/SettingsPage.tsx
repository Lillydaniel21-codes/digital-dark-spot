import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User as UserIcon,
  Cpu,
  Shield,
  LogOut,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { api } from '../services/api';
import { User, HealthStatus } from '../types';

interface SettingsPageProps {
  user: User;
  onLogout: () => void;
  onOpenSample: () => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  user,
  onLogout,
  onOpenSample,
}) => {
  const [health, setHealth] = useState<HealthStatus | null>(null);

  useEffect(() => {
    api.getHealth().then(setHealth).catch(console.error);
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="pb-6 border-b border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold mb-2">
          <SettingsIcon className="w-3.5 h-3.5 text-indigo-400" /> Platform Preferences
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          System & Account Settings
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Review your authentication profile, AI engine configuration status, and verification standards.
        </p>
      </div>

      <div className="space-y-6">
        {/* Profile Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-indigo-400 font-bold flex items-center gap-2">
            <UserIcon className="w-4 h-4" /> User Authentication Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-500 block mb-1">Authenticated Email</span>
              <span className="font-mono text-sm font-semibold text-white">{user.email}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Account Mode</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {user.is_demo ? 'Local Demo Mode' : 'Standard Research Account'}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">Session Creation Date</span>
              <span className="text-slate-300 font-mono">{new Date(user.created_at).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-500 block mb-1">User Identifier</span>
              <span className="text-slate-400 font-mono text-[11px] truncate block">{user.id}</span>
            </div>
          </div>
        </div>

        {/* AI & Infrastructure Provider Status */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-xs font-mono uppercase tracking-wider text-violet-400 font-bold flex items-center gap-2">
            <Cpu className="w-4 h-4" /> AI Engine Configuration Status
          </h3>

          <div className="space-y-3">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">External LLM Provider API</span>
                <span className="text-slate-400 text-[11px]">
                  Configured via server-side environment variables (<code className="text-slate-300">GEMINI_API_KEY</code>). Secret keys are never exposed to the frontend.
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                health?.ai_provider_configured
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
              }`}>
                {health?.ai_provider_configured ? 'Active API' : 'Local Fallback Engine'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">Email Service (SMTP)</span>
                <span className="text-slate-400 text-[11px]">
                  When unconfigured, instant local demo OTP is provided without simulating real mail transmission.
                </span>
              </div>
              <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase ${
                health?.smtp_configured
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {health?.smtp_configured ? 'SMTP Connected' : 'Local Demo OTP'}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between text-xs">
              <div>
                <span className="font-bold text-white block">Deterministic Gap Pipeline</span>
                <span className="text-slate-400 text-[11px]">
                  The 15-step category presence checker, contradiction engine, and SSRF validator are fully operational.
                </span>
              </div>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold uppercase bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Operational
              </span>
            </div>
          </div>
        </div>

        {/* Privacy & Grounding Information */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3 text-xs leading-relaxed">
          <h3 className="text-xs font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-2">
            <Shield className="w-4 h-4" /> Grounding Standards & Privacy
          </h3>
          <p className="text-slate-300">
            Digital Dark Spot is engineered to protect user privacy. Ingested URLs and documents are analyzed strictly within your current session and stored in your dedicated database. We enforce server-side SSRF validation preventing network traversal.
          </p>
          <p className="text-slate-400">
            Our detection engine explicitly labels omissions as <strong className="text-slate-200">"Not found in sources reviewed"</strong> to maintain strict evidentiary honesty and avoid false negative assumptions.
          </p>
        </div>

        {/* Logout Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-white">Sign Out of Session</h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Clears your active access token and returns to authentication screen.
            </p>
          </div>
          <button
            onClick={onLogout}
            className="px-5 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
