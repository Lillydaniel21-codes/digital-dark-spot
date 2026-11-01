import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  Trash2,
  ExternalLink,
  AlertCircle,
  FileText,
  HelpCircle,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { api } from '../services/api';
import { ChatMessage } from '../types';

interface ChatbotDrawerProps {
  researchId: string;
  projectTitle: string;
}

export const ChatbotDrawer: React.FC<ChatbotDrawerProps> = ({
  researchId,
  projectTitle,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const quickQuestions = [
    'What information is missing?',
    'Explain the conflicting claims',
    'What details may be outdated?',
    'What should I verify next?',
    'Summarize key findings',
  ];

  const fetchHistory = async () => {
    try {
      setError(null);
      const res = await api.getChatHistory(researchId);
      setMessages(res.messages || []);
    } catch (err: any) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (researchId) {
      fetchHistory();
    }
  }, [researchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const q = (textToSend || input).trim();
    if (!q || loading) return;

    setInput('');
    setError(null);
    setLoading(true);

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      text: q,
      citations: [],
      is_fallback_or_demo: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const reply = await api.sendChatMessage(researchId, q);
      setMessages((prev) => [...prev, reply]);
    } catch (err: any) {
      setError(err.message || 'Failed to send message.');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = async () => {
    if (!window.confirm('Are you sure you want to clear chat history for this research?')) return;
    try {
      await api.clearChatHistory(researchId);
      setMessages([]);
    } catch (err: any) {
      setError(err.message || 'Failed to clear conversation.');
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* Chat Header */}
      <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/30">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-tight">AI Research Assistant</h3>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                Grounded
              </span>
            </div>
            <p className="text-[11px] text-slate-400 truncate max-w-[220px] sm:max-w-md">
              Context: {projectTitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              onClick={handleClear}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
              title="Clear Conversation"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Suggested Quick Questions Bar */}
      <div className="px-4 py-2.5 bg-slate-900/50 border-b border-slate-800/80 overflow-x-auto flex items-center gap-2 scrollbar-none">
        <span className="text-[11px] text-slate-400 shrink-0 font-medium flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-indigo-400" /> Quick ask:
        </span>
        {quickQuestions.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(chip)}
            className="shrink-0 text-xs px-2.5 py-1 rounded-full bg-slate-800/80 hover:bg-indigo-600/20 hover:border-indigo-500/40 border border-slate-700/60 text-slate-300 hover:text-indigo-200 transition-all font-medium whitespace-nowrap"
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Error Alert */}
      {error && (
        <div className="mx-4 mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && !loading && (
          <div className="text-center py-12 px-4 max-w-md mx-auto">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <HelpCircle className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-semibold text-white mb-1">How can I assist your research?</h4>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Ask me about missing information, conflicting deadlines, document requirements, or verification priorities. Answers are strictly grounded in your reviewed sources.
            </p>
            <div className="grid grid-cols-1 gap-2 text-left">
              {quickQuestions.slice(0, 3).map((q, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(q)}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 text-xs text-slate-300 hover:text-white transition-all group"
                >
                  <span>{q}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-md ${
                  isUser
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                }`}
              >
                {/* Assistant Label & Demo Indicator */}
                {!isUser && (
                  <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-slate-800/80">
                    <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                      Research Assistant
                    </span>
                    {msg.is_fallback_or_demo && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Demo Mode
                      </span>
                    )}
                  </div>
                )}

                {/* Message Text formatted */}
                <div className="whitespace-pre-wrap space-y-2">{msg.text}</div>

                {/* Grounded Sourced Citations */}
                {!isUser && msg.citations && msg.citations.length > 0 && (
                  <div className="mt-3 pt-2.5 border-t border-slate-800">
                    <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-semibold mb-1.5 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-emerald-400" /> Sourced Evidence Citations:
                    </div>
                    <div className="space-y-1.5">
                      {msg.citations.map((c, cIdx) => (
                        <div
                          key={cIdx}
                          className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300"
                        >
                          <div className="flex items-center justify-between font-semibold text-indigo-300 mb-0.5">
                            <span>[{c.citation_id}] {c.title}</span>
                            {c.url && (
                              <a
                                href={c.url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-slate-400 hover:text-indigo-400"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          {c.excerpt && (
                            <p className="text-slate-400 italic text-[10px] line-clamp-2">
                              "{c.excerpt}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <span className="text-[10px] text-slate-500 mt-1 px-1">
                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3 p-3 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 text-xs max-w-xs">
            <div className="w-5 h-5 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin shrink-0" />
            <span>Analyzing research evidence & verifying sources...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask AI Research Assistant (e.g. 'What renewal conditions are missing?')..."
          className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="p-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-indigo-600/20"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
