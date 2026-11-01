import React, { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  X, 
  Mic, 
  MicOff, 
  ArrowRight, 
  Clock, 
  TrendingUp, 
  Sparkles, 
  Tag, 
  HelpCircle,
  CornerDownLeft
} from 'lucide-react';
import { api } from '../services/api';
import { SearchSuggestionItem, SearchHistoryItem } from '../types';

interface SmartSearchBarProps {
  onSelectSearch?: (item: { query: string; domain?: string; title?: string }) => void;
  placeholder?: string;
  initialDomain?: string;
  showDomainFilter?: boolean;
}

const ALL_DOMAINS = [
  'All Domains',
  'Education',
  'Employment',
  'Agriculture',
  'Government & Public Services',
  'Healthcare & Wellbeing',
  'Environment & Climate',
  'Business & Finance',
  'Technology & AI',
  'Research & Science',
  'Transportation & Travel',
  'Community & Social Problems',
  'General & Custom Topics',
];

export const SmartSearchBar: React.FC<SmartSearchBarProps> = ({
  onSelectSearch,
  placeholder = 'Search any real-world problem, scheme, topic, or question...',
  initialDomain = 'All Domains',
  showDomainFilter = true,
}) => {
  const [query, setQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState(initialDomain);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<SearchSuggestionItem[]>([]);
  const [relatedQuestions, setRelatedQuestions] = useState<string[]>([]);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  const [popular, setPopular] = useState<SearchSuggestionItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [isListening, setIsListening] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  // Load history & popular on mount or domain change
  useEffect(() => {
    loadInitialData();
  }, [selectedDomain]);

  // Handle outside clicks to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch suggestions with debounce as user types
  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      setRelatedQuestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.getSearchSuggestions(query.trim(), selectedDomain);
        setSuggestions(res.suggestions || []);
        setRelatedQuestions(res.related_questions || []);
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query, selectedDomain]);

  const loadInitialData = async () => {
    try {
      const [hist, pop] = await Promise.allSettled([
        api.getSearchHistory(),
        api.getPopularSearches(selectedDomain),
      ]);
      if (hist.status === 'fulfilled') setHistory(hist.value);
      if (pop.status === 'fulfilled') setPopular(pop.value);
    } catch {
      // Ignore background fetch error
    }
  };

  // Voice Search setup with Web Speech API
  const handleToggleVoice = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Voice search is not supported in this browser. Please try Chrome, Edge, or Safari.');
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setQuery(transcript);
        setIsOpen(true);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsListening(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setRelatedQuestions([]);
    inputRef.current?.focus();
  };

  const handleClearHistory = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.clearSearchHistory();
      setHistory([]);
    } catch (err) {
      console.error('Failed to clear search history', err);
    }
  };

  const executeSelection = async (item: { query: string; domain?: string; title?: string }) => {
    setIsOpen(false);
    try {
      await api.addSearchHistory(item.query, item.domain || selectedDomain);
    } catch {
      // Ignore history log error
    }

    if (onSelectSearch) {
      onSelectSearch(item);
    } else if (typeof window !== 'undefined') {
      const params = new URLSearchParams();
      if (item.title) params.set('title', item.title);
      params.set('q', item.query);
      if (item.domain && item.domain !== 'All Domains') params.set('domain', item.domain);
      window.history.pushState({}, '', `?${params.toString()}`);
    }
  };

  // Keyboard navigation
  const allSelectableItems = query.trim()
    ? [
        { type: 'custom', title: query, question: query, domain: selectedDomain },
        ...suggestions.map(s => ({ type: 'suggestion', ...s })),
        ...relatedQuestions.map(q => ({ type: 'related', title: q, question: q, domain: selectedDomain })),
      ]
    : [
        ...history.slice(0, 4).map(h => ({ type: 'history', title: h.query, question: h.query, domain: h.domain || selectedDomain })),
        ...popular.slice(0, 6).map(p => ({ type: 'popular', ...p })),
      ];

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < allSelectableItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : allSelectableItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < allSelectableItems.length) {
        const item = allSelectableItems[selectedIndex];
        executeSelection({
          query: item.question || item.title,
          domain: item.domain,
          title: item.title,
        });
      } else if (query.trim()) {
        executeSelection({
          query: query.trim(),
          domain: selectedDomain !== 'All Domains' ? selectedDomain : undefined,
          title: query.trim(),
        });
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto z-40">
      {/* Search Input Box */}
      <div 
        className={`relative flex items-center bg-slate-900/90 backdrop-blur-xl border-2 transition-all duration-300 rounded-2xl shadow-2xl ${
          isOpen 
            ? 'border-indigo-500 ring-4 ring-indigo-500/20 shadow-indigo-500/10' 
            : 'border-slate-700/80 hover:border-slate-600'
        }`}
      >
        {/* Domain Filter Dropdown */}
        {showDomainFilter && (
          <div className="hidden sm:flex items-center pl-3 border-r border-slate-700/80 mr-2 py-2">
            <select
              value={selectedDomain}
              onChange={(e) => {
                setSelectedDomain(e.target.value);
                inputRef.current?.focus();
              }}
              className="bg-transparent text-xs font-semibold text-slate-300 hover:text-white cursor-pointer focus:outline-none pr-1 max-w-[140px] truncate"
            >
              {ALL_DOMAINS.map(d => (
                <option key={d} value={d} className="bg-slate-900 text-slate-200">
                  {d}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Search Icon */}
        <div className="pl-4 pr-2 text-indigo-400 flex items-center justify-center">
          <Search className="w-5 h-5" />
        </div>

        {/* Input Text Field */}
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 bg-transparent py-4 text-base md:text-lg text-white placeholder-slate-400 focus:outline-none px-2"
        />

        {/* Loading Spinner */}
        {loading && (
          <div className="mr-2 animate-spin rounded-full h-4 w-4 border-2 border-indigo-400 border-t-transparent" />
        )}

        {/* Clear Button */}
        {query.length > 0 && (
          <button
            type="button"
            onClick={handleClear}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors mr-1"
            title="Clear search"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Voice Search Button */}
        <button
          type="button"
          onClick={handleToggleVoice}
          className={`p-2.5 rounded-full transition-all mr-2 ${
            isListening 
              ? 'bg-rose-500/20 text-rose-400 animate-pulse ring-2 ring-rose-500' 
              : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-800'
          }`}
          title={isListening ? 'Listening... click to stop' : 'Search by voice'}
        >
          {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
        </button>

        {/* Search / Analyze Button */}
        <button
          type="button"
          onClick={() => {
            if (query.trim()) {
              executeSelection({
                query: query.trim(),
                domain: selectedDomain !== 'All Domains' ? selectedDomain : undefined,
                title: query.trim(),
              });
            } else {
              setIsOpen(true);
              inputRef.current?.focus();
            }
          }}
          className="mr-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all transform active:scale-95"
        >
          <span className="hidden sm:inline">Detect Gaps</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Dropdown Suggestions Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/98 backdrop-blur-2xl border border-slate-700/90 rounded-2xl shadow-2xl overflow-hidden z-50 max-h-[480px] overflow-y-auto divide-y divide-slate-800">
          
          {/* Case 1: When user types query */}
          {query.trim().length > 0 ? (
            <div className="p-2 space-y-1">
              {/* Quick direct search option */}
              <button
                type="button"
                onClick={() => executeSelection({ query: query.trim(), domain: selectedDomain !== 'All Domains' ? selectedDomain : undefined, title: query.trim() })}
                className="w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between text-indigo-300 hover:bg-indigo-600/10 hover:text-indigo-200 transition-colors group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
                  <span className="truncate">
                    Analyze information gaps for: <strong className="text-white">"{query.trim()}"</strong>
                  </span>
                </div>
                <CornerDownLeft className="w-3.5 h-3.5 text-slate-500 group-hover:text-indigo-400 shrink-0" />
              </button>

              {/* Suggestions List */}
              {suggestions.length > 0 && (
                <div className="pt-2">
                  <div className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-indigo-400" />
                    Verified Research Suggestions
                  </div>
                  {suggestions.map((item, idx) => (
                    <button
                      key={item.id || idx}
                      type="button"
                      onClick={() => executeSelection({ 
                        query: item.question || item.query || item.title || '', 
                        domain: item.domain, 
                        title: item.title || item.query || '' 
                      })}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl hover:bg-slate-800/90 transition-colors flex items-start gap-3 group"
                    >
                      <Search className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 mt-1 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-slate-200 group-hover:text-white">
                            {item.title}
                          </span>
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                            {item.domain}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 truncate mt-0.5">
                          {item.question}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity mt-1 shrink-0" />
                    </button>
                  ))}
                </div>
              )}

              {/* Related Questions */}
              {relatedQuestions.length > 0 && (
                <div className="pt-2">
                  <div className="px-3.5 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                    Key Questions Often Missing / Incomplete
                  </div>
                  {relatedQuestions.map((q, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => executeSelection({ query: q, domain: selectedDomain !== 'All Domains' ? selectedDomain : undefined, title: q })}
                      className="w-full text-left px-3.5 py-2 rounded-xl hover:bg-slate-800/80 text-sm text-slate-300 hover:text-white transition-colors flex items-center gap-2.5 group"
                    >
                      <span className="text-amber-400 font-bold text-xs shrink-0">?</span>
                      <span className="truncate flex-1">{q}</span>
                      <CornerDownLeft className="w-3.5 h-3.5 text-slate-600 group-hover:text-amber-400 shrink-0" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Case 2: When input is empty / initial focus */
            <div className="p-3 space-y-3">
              {/* Recent Search History */}
              {history.length > 0 && (
                <div>
                  <div className="flex items-center justify-between px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-indigo-400" />
                      Recent Searches
                    </span>
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="text-[11px] text-slate-500 hover:text-rose-400 transition-colors lowercase"
                    >
                      clear history
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {history.slice(0, 6).map((h) => (
                      <button
                        key={h.id}
                        type="button"
                        onClick={() => executeSelection({ query: h.query, domain: h.domain, title: h.query })}
                        className="px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700/90 text-xs text-slate-300 hover:text-white flex items-center gap-1.5 transition-all"
                      >
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span className="truncate max-w-[180px]">{h.query}</span>
                        {h.domain && (
                          <span className="text-[10px] text-indigo-400 font-medium">({h.domain.split(' ')[0]})</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Real-World Research Topics */}
              <div>
                <div className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  Popular Research Topics Across Domains
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 pt-1">
                  {popular.slice(0, 8).map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => executeSelection({ 
                        query: p.question || p.query || p.title || '', 
                        domain: p.domain, 
                        title: p.title || p.query || '' 
                      })}
                      className="text-left px-3 py-2 rounded-xl hover:bg-slate-800/90 transition-all flex items-start gap-2.5 group"
                    >
                      <Tag className="w-3.5 h-3.5 text-indigo-400 mt-0.5 shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-medium text-slate-200 group-hover:text-indigo-300 truncate">
                          {p.title}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {p.domain}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Footer note */}
          <div className="px-4 py-2 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
            <span>Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">Enter</kbd> to analyze any custom topic</span>
            <span className="hidden sm:inline">Use <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">↑</kbd> <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-mono text-[10px]">↓</kbd> to navigate</span>
          </div>
        </div>
      )}
    </div>
  );
};
