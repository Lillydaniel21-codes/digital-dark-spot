import React from 'react';
import { Shield, Sparkles, LogOut, PlusCircle, Compass, Home, Layers, Info } from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  onLogout,
  onNavigate,
  currentPage
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div 
          onClick={() => onNavigate(user ? 'dashboard' : 'home')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                Digital Dark Spot
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] uppercase font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                AI Platform
              </span>
            </div>
            <p className="hidden md:block text-[11px] text-slate-400 font-medium">
              Information Gap & Contradiction Detection
            </p>
          </div>
        </div>

        {/* Center Navigation Links (when on landing or for general navigation) */}
        {!user ? (
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-300">
            <button 
              onClick={() => onNavigate('home')} 
              className={`hover:text-indigo-400 transition-colors ${currentPage === 'home' ? 'text-indigo-400 font-semibold' : ''}`}
            >
              Home
            </button>
            <a href="#features" className="hover:text-indigo-400 transition-colors">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-indigo-400 transition-colors">
              How It Works
            </a>
            <a href="#architecture" className="hover:text-indigo-400 transition-colors">
              Architecture
            </a>
            <a href="#about" className="hover:text-indigo-400 transition-colors">
              About
            </a>
          </nav>
        ) : (
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium text-slate-300">
            <button
              onClick={() => onNavigate('dashboard')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentPage === 'dashboard'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'hover:bg-slate-900 text-slate-300'
              }`}
            >
              <Compass className="w-4 h-4 text-indigo-400" /> Dashboard
            </button>
            <button
              onClick={() => onNavigate('history')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                currentPage === 'history'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'hover:bg-slate-900 text-slate-300'
              }`}
            >
              <Layers className="w-4 h-4 text-violet-400" /> Research History
            </button>
          </nav>
        )}

        {/* Right Action Area */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* New Research Action */}
              <button
                onClick={() => onNavigate('new-research')}
                className="hidden sm:inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all hover:scale-[1.02]"
              >
                <PlusCircle className="w-4 h-4" />
                <span>New Research</span>
              </button>

              {/* User Pill */}
              <div 
                onClick={() => onNavigate('settings')}
                className="flex items-center gap-2 pl-3 pr-2 py-1 rounded-full bg-slate-900 border border-slate-800 hover:border-slate-700 cursor-pointer transition-all"
                title="View Account & Settings"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span className="text-xs text-slate-300 font-mono max-w-[120px] sm:max-w-[180px] truncate">
                  {user.email}
                </span>
                {user.is_demo && (
                  <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[9px] font-bold rounded uppercase">
                    Demo
                  </span>
                )}
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <a
              href="#auth-section"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <Sparkles className="w-4 h-4" />
              <span>Sign In / Demo</span>
            </a>
          )}
        </div>
      </div>
    </header>
  );
};
