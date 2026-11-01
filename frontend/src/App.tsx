import React, { useState, useEffect } from 'react';
import { Bot, X, Sparkles } from 'lucide-react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { ChatbotDrawer } from './components/ChatbotDrawer';

import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { NewResearchPage } from './pages/NewResearchPage';
import { SourcesPage } from './pages/SourcesPage';
import { AnalysisPage } from './pages/AnalysisPage';
import { ChatbotPage } from './pages/ChatbotPage';
import { ReportsPage } from './pages/ReportsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

import { api, removeAuthToken } from './services/api';
import { User, ResearchProject } from './types';

export function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [activeProject, setActiveProject] = useState<ResearchProject | null>(null);
  const [showFloatingChat, setShowFloatingChat] = useState<boolean>(false);
  const [initializing, setInitializing] = useState<boolean>(true);
  const [newResearchPrefill, setNewResearchPrefill] = useState<any>(null);

  // Check existing session
  useEffect(() => {
    const savedToken = localStorage.getItem('dds_token');
    const savedUserStr = localStorage.getItem('dds_user');

    if (savedToken && savedUserStr) {
      try {
        const parsedUser = JSON.parse(savedUserStr);
        setUser(parsedUser);
      } catch {
        removeAuthToken();
      }
    }
    setInitializing(false);
  }, []);

  const handleLoginSuccess = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentTab('dashboard');
  };

  const handleLogout = () => {
    removeAuthToken();
    setUser(null);
    setActiveProject(null);
    setCurrentTab('home');
  };

  const handleLoadSampleProject = async (domain?: string) => {
    try {
      const sampleProj = await api.loadSampleResearch(domain);
      setActiveProject(sampleProj);
      setCurrentTab('analysis');
    } catch (err: any) {
      alert(err.message || 'Failed to load sample research project.');
    }
  };

  const handleSelectProject = async (projectId: string, targetTab: string = 'analysis') => {
    try {
      const proj = await api.getResearch(projectId);
      setActiveProject(proj);
      setCurrentTab(targetTab);
    } catch (err: any) {
      alert(err.message || 'Failed to load research project.');
    }
  };

  if (initializing) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex items-center justify-center text-slate-400 text-xs font-mono">
        Initializing Digital Dark Spot Intelligence...
      </div>
    );
  }

  // Enforce Authentication Gate:
  // If user is not authenticated, show the Landing Page with Architecture, Features & Login
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0b1120] flex flex-col">
        <Navbar
          user={null}
          onLogout={handleLogout}
          onNavigate={(page) => setCurrentTab(page)}
          currentPage={currentTab}
        />
        <main className="flex-1">
          <LandingPage onLoginSuccess={handleLoginSuccess} />
        </main>
      </div>
    );
  }

  // Once authenticated, open the full platform with Sidebar, Header, Pages & Assistant
  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onNavigate={(tab) => setCurrentTab(tab)}
        currentPage={currentTab}
      />

      <div className="flex-1 flex max-w-7xl mx-auto w-full">
        {/* Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          activeProject={activeProject}
          onOpenSample={handleLoadSampleProject}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <DashboardPage
              onNavigate={(tab, projId, initialData) => {
                if (initialData) {
                  setNewResearchPrefill(initialData);
                }
                if (projId) {
                  handleSelectProject(projId, tab);
                } else {
                  setCurrentTab(tab);
                }
              }}
              onOpenSample={handleLoadSampleProject}
            />
          )}

          {currentTab === 'new-research' && (
            <NewResearchPage
              initialData={newResearchPrefill}
              onCreated={(proj) => {
                setNewResearchPrefill(null);
                setActiveProject(proj);
                setCurrentTab('sources');
              }}
              onOpenSample={handleLoadSampleProject}
            />
          )}

          {currentTab === 'sources' && activeProject && (
            <SourcesPage
              project={activeProject}
              onRunAnalysis={() => setCurrentTab('analysis')}
            />
          )}

          {currentTab === 'analysis' && activeProject && (
            <AnalysisPage
              project={activeProject}
              onOpenAssistant={() => setCurrentTab('assistant')}
              onOpenReport={() => setCurrentTab('reports')}
            />
          )}

          {currentTab === 'assistant' && activeProject && (
            <ChatbotPage
              project={activeProject}
              onNavigate={(tab) => setCurrentTab(tab)}
            />
          )}

          {currentTab === 'reports' && activeProject && (
            <ReportsPage
              project={activeProject}
              onOpenAssistant={() => setCurrentTab('assistant')}
            />
          )}

          {currentTab === 'history' && (
            <HistoryPage
              onSelectProject={handleSelectProject}
              onOpenSample={handleLoadSampleProject}
            />
          )}

          {currentTab === 'settings' && (
            <SettingsPage
              user={user}
              onLogout={handleLogout}
              onOpenSample={handleLoadSampleProject}
            />
          )}
        </main>
      </div>

      {/* Floating Chatbot Assistant Widget Button */}
      {activeProject && currentTab !== 'assistant' && (
        <div className="fixed bottom-6 right-6 z-50">
          {showFloatingChat ? (
            <div className="w-[360px] sm:w-[420px] h-[550px] bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative animate-in fade-in slide-in-from-bottom-5">
              <button
                onClick={() => setShowFloatingChat(false)}
                className="absolute top-4 right-4 z-10 text-slate-400 hover:text-white p-1"
                title="Minimize Assistant"
              >
                <X className="w-4 h-4" />
              </button>
              <ChatbotDrawer
                researchId={activeProject.id}
                projectTitle={activeProject.title}
              />
            </div>
          ) : (
            <button
              onClick={() => setShowFloatingChat(true)}
              className="px-4 py-3 rounded-full bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-2xl shadow-indigo-600/40 flex items-center gap-2 hover:scale-105 transition-all group border border-indigo-400/30"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <Bot className="w-4 h-4 text-white" />
              <span>AI Research Assistant</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default App;
