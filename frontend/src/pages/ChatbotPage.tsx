import React from 'react';
import { Bot, ArrowLeft, Database, FileSpreadsheet } from 'lucide-react';
import { ChatbotDrawer } from '../components/ChatbotDrawer';
import { ResearchProject } from '../types';

interface ChatbotPageProps {
  project: ResearchProject;
  onNavigate: (tab: string) => void;
}

export const ChatbotPage: React.FC<ChatbotPageProps> = ({
  project,
  onNavigate,
}) => {
  return (
    <div className="max-w-5xl mx-auto space-y-4 h-[calc(100vh-6.5rem)] flex flex-col">
      {/* Top Banner */}
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('analysis')}
            className="p-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <Bot className="w-5 h-5 text-indigo-400" />
              <span>AI Research Assistant</span>
            </h1>
            <p className="text-xs text-slate-400">
              Grounded conversational verification for <span className="text-slate-200 font-semibold">{project.title}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('analysis')}
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 font-medium transition-colors flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-400" />
            <span>View Analysis</span>
          </button>
        </div>
      </div>

      {/* Full-Height Chat Component */}
      <div className="flex-1 min-h-0">
        <ChatbotDrawer
          researchId={project.id}
          projectTitle={project.title}
        />
      </div>
    </div>
  );
};
