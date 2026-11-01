import React from 'react';
import {
  LayoutDashboard,
  PlusCircle,
  History,
  FileText,
  Bot,
  FileSpreadsheet,
  Settings,
  Sparkles,
  ChevronRight,
  Database
} from 'lucide-react';
import { ResearchProject } from '../types';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  activeProject: ResearchProject | null;
  onOpenSample: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  activeProject,
  onOpenSample,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'new-research', label: 'New Research', icon: PlusCircle },
    { id: 'history', label: 'Research History', icon: History },
    { id: 'sources', label: 'Sources', icon: Database, disabled: !activeProject },
    { id: 'analysis', label: 'AI Analysis & Gaps', icon: FileSpreadsheet, disabled: !activeProject },
    { id: 'assistant', label: 'AI Assistant', icon: Bot, disabled: !activeProject },
    { id: 'reports', label: 'Research Reports', icon: FileText, disabled: !activeProject },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-950/70 border-r border-slate-800/80 flex flex-col justify-between p-4 shrink-0 h-[calc(100vh-4rem)] sticky top-16 hidden lg:flex">
      <div className="space-y-6">
        {/* Active Project Card */}
        {activeProject ? (
          <div className="p-3.5 bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30 rounded-xl relative overflow-hidden group">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-mono text-indigo-400 uppercase tracking-wider font-semibold">
                Active Research
              </span>
              <span className={`inline-block w-2 h-2 rounded-full ${
                activeProject.status === 'analyzed' ? 'bg-emerald-400' : 'bg-amber-400'
              }`} />
            </div>
            <h4 className="text-white text-xs font-bold truncate leading-tight mb-1" title={activeProject.title}>
              {activeProject.title}
            </h4>
            <p className="text-slate-400 text-[11px] line-clamp-2 italic">
              "{activeProject.research_question}"
            </p>
          </div>
        ) : (
          <div className="p-3.5 bg-slate-900/60 border border-dashed border-slate-800 rounded-xl text-center">
            <p className="text-slate-400 text-xs mb-2.5">No research project currently selected</p>
            <button
              onClick={onOpenSample}
              className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-medium rounded-lg transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" /> Load Sample Project
            </button>
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => !item.disabled && onSelectTab(item.id)}
                disabled={item.disabled}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/25 font-semibold'
                    : item.disabled
                    ? 'text-slate-600 cursor-not-allowed opacity-50'
                    : 'text-slate-300 hover:text-white hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-indigo-200" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Sidebar Footer Quick Action */}
      <div className="pt-4 border-t border-slate-800/80">
        <button
          onClick={onOpenSample}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-indigo-300 text-xs transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>Explore Benchmark Demo</span>
        </button>
      </div>
    </aside>
  );
};
