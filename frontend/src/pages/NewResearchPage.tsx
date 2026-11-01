import React, { useState, useEffect } from 'react';
import {
  PlusCircle,
  Sparkles,
  Link as LinkIcon,
  Upload,
  FileText,
  AlertCircle,
  Trash2,
  ArrowRight,
  MapPin,
  AlertTriangle,
  HelpCircle
} from 'lucide-react';
import { api } from '../services/api';
import { ResearchProject } from '../types';

interface NewResearchPageProps {
  onCreated: (project: ResearchProject) => void;
  onOpenSample: (domain?: string) => void;
  initialData?: {
    title?: string;
    question?: string;
    topic?: string;
    location?: string;
    goal?: string;
    keywords?: string;
  };
}

export const DOMAIN_OPTIONS = [
  'Education & Admissions',
  'Employment & Careers',
  'Agriculture & Rural',
  'Government & Public Services',
  'Healthcare & Wellbeing',
  'Environment & Climate',
  'Business & Finance',
  'Technology & AI',
  'Research & Science',
  'Transportation & Travel',
  'Community & Social Issues',
  'Other / Custom Topic',
];

export const NewResearchPage: React.FC<NewResearchPageProps> = ({
  onCreated,
  onOpenSample,
  initialData,
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [question, setQuestion] = useState(initialData?.question || '');
  const [topic, setTopic] = useState(initialData?.topic || 'Education & Admissions');
  const [location, setLocation] = useState(initialData?.location || '');
  const [goal, setGoal] = useState(initialData?.goal || '');
  const [keywords, setKeywords] = useState(initialData?.keywords || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // URL input fields
  const [urls, setUrls] = useState<string[]>(['']);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Check URL query parameters or props on mount
  useEffect(() => {
    if (initialData) {
      if (initialData.title) setTitle(initialData.title);
      if (initialData.question) setQuestion(initialData.question);
      if (initialData.topic) setTopic(initialData.topic);
      if (initialData.location) setLocation(initialData.location);
    } else if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlQ = params.get('q');
      const urlTitle = params.get('title');
      const urlDomain = params.get('domain');
      const urlLoc = params.get('location');

      if (urlTitle) setTitle(urlTitle);
      else if (urlQ) setTitle(urlQ);

      if (urlQ) setQuestion(urlQ);
      if (urlDomain) {
        const matched = DOMAIN_OPTIONS.find(d => d.toLowerCase().includes(urlDomain.toLowerCase()));
        if (matched) setTopic(matched);
      }
      if (urlLoc) setLocation(urlLoc);
    }
  }, [initialData]);

  const handleAddUrlField = () => {
    setUrls([...urls, '']);
  };

  const handleUrlChange = (idx: number, val: string) => {
    const updated = [...urls];
    updated[idx] = val;
    setUrls(updated);
  };

  const handleRemoveUrl = (idx: number) => {
    setUrls(urls.filter((_, i) => i !== idx));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selected = Array.from(e.target.files);
      setUploadedFiles((prev) => [...prev, ...selected]);
    }
  };

  const handleRemoveFile = (idx: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !question.trim()) {
      setError('Title and Research Question are required.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Create project with universal domain & location
      const project = await api.createResearch({
        title: title.trim(),
        research_question: question.trim(),
        topic,
        location: location.trim() || undefined,
        goal: goal.trim() || undefined,
        keywords: keywords.trim() || undefined,
      });

      // 2. Add URLs
      const validUrls = urls.filter((u) => u.trim() !== '');
      for (const u of validUrls) {
        try {
          await api.addUrlSource(project.id, u.trim());
        } catch (urlErr) {
          console.warn(`URL extraction warning:`, urlErr);
        }
      }

      // 3. Upload Files
      for (const f of uploadedFiles) {
        try {
          await api.uploadDocumentSource(project.id, f);
        } catch (fileErr) {
          console.warn(`File upload warning:`, fileErr);
        }
      }

      onCreated(project);
    } catch (err: any) {
      setError(err.message || 'Failed to initialize research project.');
      setLoading(false);
    }
  };

  const isHealthcare = topic.toLowerCase().includes('health') || topic.toLowerCase().includes('wellbeing');

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <PlusCircle className="w-3.5 h-3.5" /> Universal Research Intake Setup
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Create Research Investigation
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Specify any real-world inquiry, provide multi-source documents or URLs, and launch the gap detection engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenSample()}
            className="self-start sm:self-auto px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-indigo-300 text-xs font-semibold transition-colors flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span>Load Benchmark Case</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core Metadata Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 font-mono mb-2">
            1. Research Scope & Inquiry
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Research Title <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. PM-KUSUM Solar Pump Subsidy Verification, or Cross-Border Remote IP Terms"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Research Question / Problem Statement <span className="text-rose-400">*</span></span>
              <span className="text-[11px] text-slate-400 font-normal">Any real-world topic is supported</span>
            </label>
            <textarea
              required
              rows={3}
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="e.g. What are the mandatory land ownership rules and disbursement timelines for PM-KUSUM Component-B solar pumps?"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              The AI gap engine compares your source evidence against domain expectations to detect what was omitted, conflicting, or unverified.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Domain / Category <span className="text-rose-400">*</span>
              </label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
              >
                {DOMAIN_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                <span>Location / Jurisdiction (optional)</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. California, India, London, Federal, Regional"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Clinical Disclaimer Banner for Healthcare */}
          {isHealthcare && (
            <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-800/50 flex items-start gap-2.5 text-xs text-rose-200">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block text-rose-300">Important Medical Notice:</strong>
                Informational information gap analysis only. Not medical advice. Always consult certified medical practitioners or official clinical authorities for health decisions.
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Keywords / Specific Concepts (optional)
              </label>
              <input
                type="text"
                value={keywords}
                onChange={(e) => setKeywords(e.target.value)}
                placeholder="subsidy, waiting period, non-compete, runoff"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Research Goal / Decision Objective (optional)
              </label>
              <input
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. Ensure all hidden exclusion clauses and conflicting timelines are audited."
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Sources Intake Card */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider text-slate-400 font-mono">
              2. Source Material Ingestion
            </h3>
            <span className="text-xs text-slate-400">
              Web URLs, PDFs, DOCX, TXT
            </span>
          </div>

          {/* URLs section */}
          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Webpage URLs
            </label>
            {urls.map((url, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => handleUrlChange(idx, e.target.value)}
                    placeholder="https://example.gov.in/scheme-guidelines"
                    className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                {urls.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveUrl(idx)}
                    className="p-2 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={handleAddUrlField}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1"
            >
              + Add another URL
            </button>
          </div>

          {/* Documents Upload Section */}
          <div className="pt-4 border-t border-slate-800 space-y-3">
            <label className="block text-xs font-semibold text-slate-300">
              Upload Guidelines & Documentation
            </label>
            <div className="border-2 border-dashed border-slate-800 hover:border-indigo-500/50 rounded-xl p-6 text-center cursor-pointer transition-colors bg-slate-950/40 relative">
              <input
                type="file"
                multiple
                accept=".pdf,.docx,.txt"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-xs text-slate-300 font-medium">
                Click to browse or drag and drop files
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Supports PDF, Word (DOCX), and TXT files up to 25 MB
              </p>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[11px] font-mono uppercase text-slate-400 block font-semibold">
                  Selected Files ({uploadedFiles.length}):
                </span>
                {uploadedFiles.map((f, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      <span className="font-medium truncate max-w-xs">{f.name}</span>
                      <span className="text-[10px] text-slate-500 font-mono">
                        ({(f.size / 1024).toFixed(1)} KB)
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveFile(i)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/25 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span>Ingesting Sources & Initializing...</span>
            ) : (
              <>
                <span>Create & Review Sources</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
