import React, { useState } from 'react';
import {
  Shield,
  Sparkles,
  ArrowRight,
  Database,
  Search,
  AlertTriangle,
  Clock,
  CheckCircle2,
  ListChecks,
  Bot,
  Mail,
  KeyRound,
  FileText,
  Layers,
  HelpCircle,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Check,
  Globe,
  FileSpreadsheet,
  Sprout,
  HeartPulse,
  Trees,
  Briefcase,
  GraduationCap,
  Landmark
} from 'lucide-react';
import { ArchitectureDiagram } from '../components/ArchitectureDiagram';
import { api } from '../services/api';
import { User } from '../types';

interface LandingPageProps {
  onLoginSuccess: (user: User) => void;
}

const DOMAIN_SHOWCASE = [
  {
    title: 'Agriculture & Rural',
    desc: 'Audit solar pump schemes, crop insurance exclusions, and farmer subsidies.',
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=600&q=80',
    icon: Sprout,
    example: 'PM-KUSUM Component-B subsidy disbursement timeline & land quotas'
  },
  {
    title: 'Healthcare & Wellbeing',
    desc: 'Audit telemedicine policies, drug schedules, and health insurance terms.',
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=600&q=80',
    icon: HeartPulse,
    example: 'Telemedicine Schedule X restricted prescriptions & waiting period waivers'
  },
  {
    title: 'Environment & Climate',
    desc: 'Analyze municipal drainage flood capacities, industrial emissions, and air quality.',
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=600&q=80',
    icon: Trees,
    example: 'Stormwater catchment peak runoff specs vs 100-year flood levels'
  },
  {
    title: 'Employment & Contracts',
    desc: 'Verify cross-border remote worker contracts, IP assignment, and severance rights.',
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80',
    icon: Briefcase,
    example: 'Independent contractor tax nexus & arbitration clause validity'
  },
  {
    title: 'Education & Admissions',
    desc: 'Examine fellowships, degree prerequisites, and multi-year retention rules.',
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=600&q=80',
    icon: GraduationCap,
    example: 'International STEM fellowship stipend taxability & service bonds'
  },
  {
    title: 'Government & Public Services',
    desc: 'Audit civic welfare programs, citizen rights, and municipal permits.',
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=600&q=80',
    icon: Landmark,
    example: 'Senior citizen welfare enrollment documentation & grievance redressal'
  }
];

const FAQS = [
  {
    q: 'What is an "Information Gap"?',
    a: 'An information gap represents crucial decision criteria that are missing, omitted, or unaddressed in the sources you provide. While traditional AI summarizes what is written, our gap engine evaluates what is absent based on domain benchmarks.'
  },
  {
    q: 'Can I research topics outside of preset categories?',
    a: 'Yes, absolutely. The platform supports universal research. You can select "Other / Custom Topic" and enter any real-world inquiry, uploaded document corpus, or URL list.'
  },
  {
    q: 'How does the platform handle healthcare or clinical topics?',
    a: 'For healthcare and clinical topics, the system flags informational gaps while providing explicit medical disclaimers reminding users that AI analysis is for informational verification only and cannot replace licensed clinical practitioners.'
  },
  {
    q: 'How are conflicting claims identified and cited?',
    a: 'The engine parses and chunks each source with an immutable citation ID (e.g. SRC-001). When two sources assert contradictory details—such as different deadlines or opposing eligibility rules—the system aligns both claims side-by-side with exact citations and explains plausible reasons for the discrepancy.'
  },
  {
    q: 'Can I export research reports?',
    a: 'Yes. Every research investigation produces a comprehensive report that can be exported both as an executive PDF document and as a structured CSV audit file for spreadsheet analysis.'
  }
];

export const LandingPage: React.FC<LandingPageProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [demoCode, setDemoCode] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMessage(null);
    setInfoMessage(null);

    try {
      const res = await api.requestCode(email.trim());
      setInfoMessage(res.message);
      if (res.demo_code) {
        setDemoCode(res.demo_code);
        setCode(res.demo_code); // Pre-fill for frictionless review in local demo mode
      }
      setStep('code');
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to request login code.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setErrorMessage(null);

    try {
      const res = await api.verifyCode(email.trim(), code.trim());
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Verification failed. Please check your code.');
    } finally {
      setLoading(false);
    }
  };

  const handleInstantDemoLogin = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await api.demoLogin();
      onLoginSuccess(res.user);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to initialize demo login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b1120] text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full overflow-hidden">
        {/* Ambient Glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[380px] bg-gradient-to-tr from-indigo-600/15 via-violet-600/15 to-cyan-500/10 blur-[140px] pointer-events-none rounded-full" />

        <div className="text-center max-w-3xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-950/80 border border-indigo-500/30 text-indigo-300 text-xs font-semibold mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>AI-Assisted Information Gap Detection Platform</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight leading-[1.1] mb-6">
            Discover What Information <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-300">
              Is Missing.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8 font-normal">
            Analyze multiple sources across any real-world domain. Expose missing information, conflicting claims, and outdated details before making critical decisions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <a
              href="#auth-section"
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] flex items-center justify-center gap-2"
            >
              <span>Start Universal Research</span>
              <ArrowRight className="w-4 h-4" />
            </a>
            <button
              onClick={handleInstantDemoLogin}
              disabled={loading}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-indigo-500/40 text-slate-200 font-semibold text-sm transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span>Explore Demo Access</span>
            </button>
          </div>
        </div>

        {/* Multi-Domain Interactive Visual Preview */}
        <div className="relative mx-auto max-w-5xl rounded-2xl p-2 bg-gradient-to-b from-indigo-500/20 via-slate-800/40 to-transparent border border-slate-800/80 shadow-2xl backdrop-blur-xl">
          <div className="rounded-xl bg-slate-950/90 border border-slate-800/80 p-5 md:p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-800/80 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80" />
                <span className="w-3 h-3 rounded-full bg-amber-500/80" />
                <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
                <span className="text-xs font-mono text-slate-300 ml-2">Digital Dark Spot • Real-World Audit Intelligence</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                  Multi-Source Cross-Examination
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-bold mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Hidden Gaps Detected</span>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">Unstated Quota Formulas</h4>
                <p className="text-xs text-slate-400">
                  Status: <span className="text-rose-300 font-medium">Not found in sources reviewed</span>. Official portal omits state vs central subsidy splits and land deed verification steps.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-2">
                  <Clock className="w-4 h-4" />
                  <span>Conflicting Claims</span>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">Contradictory Requirements</h4>
                <p className="text-xs text-slate-400">
                  [SRC-001] mandates mandatory physical verification prior to sanction, whereas [SRC-002] states self-certification is permitted.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/70 border border-slate-800">
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold mb-2">
                  <ListChecks className="w-4 h-4" />
                  <span>Verification Checklist</span>
                </div>
                <h4 className="text-sm font-semibold text-white mb-1">Traceable Action Plan</h4>
                <p className="text-xs text-slate-400">
                  Generates prioritized inquiries and questions to ask responsible authorities before signing or committing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Universal Domain Showcase with Curated Imagery */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full border-t border-slate-800/80">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <Globe className="w-3.5 h-3.5" /> Universal Scope
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2">
            Built for Any Real-World Information Problem
          </h2>
          <p className="text-slate-400 text-sm">
            From rural agricultural schemes to international employment contracts and clinical policies, our AI analyzes what was left unsaid.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DOMAIN_SHOWCASE.map((d, i) => {
            const Icon = d.icon;
            return (
              <div key={i} className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900/60 flex flex-col group hover:border-slate-700 transition-all">
                <div className="h-40 relative overflow-hidden">
                  <img
                    src={d.image}
                    alt={d.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
                  <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between">
                    <span className="text-sm font-bold text-white flex items-center gap-2">
                      <Icon className="w-4 h-4 text-indigo-400" />
                      {d.title}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <p className="text-xs text-slate-300 mb-3">{d.desc}</p>
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-indigo-300 italic">
                    "{d.example}"
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Authentication Gateway Section */}
      <section id="auth-section" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="max-w-md mx-auto bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl relative">
          <div className="text-center mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white mx-auto mb-3 shadow-lg shadow-indigo-600/30">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Access Platform</h2>
            <p className="text-xs text-slate-400 mt-1">
              Email-only authentication. No passwords needed.
            </p>
          </div>

          {infoMessage && (
            <div className="mb-4 p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs leading-relaxed">
              {infoMessage}
            </div>
          )}

          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
              {errorMessage}
            </div>
          )}

          {step === 'email' ? (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.com"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span>Sending code...</span>
                ) : (
                  <>
                    <span>Send Login Code</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-300">
                    6-Digit Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => setStep('email')}
                    className="text-[11px] text-indigo-400 hover:underline"
                  >
                    Change email
                  </button>
                </div>
                <input
                  type="text"
                  maxLength={8}
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. 123456"
                  className="w-full text-center tracking-[6px] font-mono font-bold text-lg py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-xs shadow-md shadow-indigo-600/25 transition-all flex items-center justify-center gap-2"
              >
                {loading ? <span>Verifying...</span> : <span>Confirm & Open Platform</span>}
              </button>

              <div className="text-center">
                <button
                  type="button"
                  onClick={handleRequestCode}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  Didn't receive code? Resend
                </button>
              </div>
            </form>
          )}

          {/* Local Demo Mode Quick Access */}
          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block mb-2 font-medium">
              Evaluating in local demo mode?
            </span>
            <button
              type="button"
              onClick={handleInstantDemoLogin}
              className="w-full py-2 px-3 rounded-xl bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/30 text-indigo-300 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Instant Local Demo Login</span>
            </button>
          </div>
        </div>
      </section>

      {/* System Architecture Section */}
      <section id="architecture" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <ArchitectureDiagram />
      </section>

      {/* 7 Key Feature Cards */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-3">
            Built to Expose the Unknowns
          </h2>
          <p className="text-slate-400 text-sm">
            Conventional search tells you what is written. Digital Dark Spot reveals what was left out, contradicted, or outdated.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-white font-bold text-base mb-2">Universal Information Gap Engine</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Dynamically analyzes expected domain categories and classifies omissions as <span className="text-rose-300">"Not found in sources reviewed"</span> rather than assuming they don't exist.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-white font-bold text-base mb-2">Multi-Source Ingestion</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Upload PDF documents, Word DOCX files, plain text files, or live URLs protected against SSRF vulnerabilities.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mb-4">
              <Clock className="w-5 h-5" />
            </div>
            <h3 className="text-white font-bold text-base mb-2">Conflict Resolution Engine</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Compares claim against claim with citation IDs, explaining plausible reasons for differences (policy revisions vs different cohorts).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 text-violet-400 flex items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="text-white font-bold text-base mb-2">Outdated Information Warnings</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Flags stale cycle years and past deadlines without incorrectly penalizing sources simply because a publication timestamp is missing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h3 className="text-white font-bold text-base mb-2">Evidence-Backed Findings</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Every verified finding is backed with citation identifiers (<code className="text-emerald-300">SRC-001</code>) and evidence strength rankings (Strong to Insufficient).
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center mb-4">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-white font-bold text-base mb-2">AI Research Assistant Chatbot</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Context-aware chatbot with source grounding. If evidence is lacking, it explicitly states it and suggests next verification actions.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full border-t border-slate-800/80">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-2">
            <HelpCircle className="w-3.5 h-3.5" /> FAQ
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-slate-900/70 overflow-hidden transition-all"
            >
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-sm sm:text-base text-white hover:text-indigo-300 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown
                  className={`w-4 h-4 text-slate-400 transition-transform ${
                    openFaq === idx ? 'rotate-180 text-indigo-400' : ''
                  }`}
                />
              </button>
              {openFaq === idx && (
                <div className="px-5 pb-5 text-xs sm:text-sm text-slate-300 leading-relaxed border-t border-slate-800/60 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-800/80 bg-slate-950 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-400" />
            <span className="font-semibold text-slate-300">Digital Dark Spot</span>
            <span>— AI-Assisted Information Gap Detection Platform</span>
          </div>
          <p>© {new Date().getFullYear()} Digital Dark Spot. Grounded Research & Verification Intelligence.</p>
        </div>
      </footer>
    </div>
  );
};
