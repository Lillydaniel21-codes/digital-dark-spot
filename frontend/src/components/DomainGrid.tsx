import React, { useState } from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  Sprout, 
  Landmark, 
  HeartPulse, 
  Trees, 
  TrendingUp, 
  Cpu, 
  Microscope, 
  Bus, 
  Users, 
  Compass, 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle,
  Sparkles
} from 'lucide-react';

export interface DomainItem {
  id: string;
  name: string;
  shortDesc: string;
  icon: React.ElementType;
  image: string;
  color: string;
  badge: string;
  sampleTopics: string[];
  commonGaps: string[];
  disclaimer?: string;
}

export const DOMAINS_DATA: DomainItem[] = [
  {
    id: 'agriculture',
    name: 'Agriculture & Rural',
    shortDesc: 'Farmer subsidies, irrigation, solar pumps, MSP, and crop insurance.',
    icon: Sprout,
    image: 'https://images.unsplash.com/photo-1500937386664-56d1dfef3854?auto=format&fit=crop&w=800&q=80',
    color: 'from-emerald-600/80 to-teal-900/90',
    badge: 'Farming & Schemes',
    sampleTopics: [
      'PM-KUSUM Solar Pump subsidy disbursement delays',
      'Crop insurance claim dispute periods & exclusion clauses',
      'Organic fertilizer certification and soil testing subsidies'
    ],
    commonGaps: ['Disbursement timeline', 'State vs Central quota split', 'Mandatory land documents']
  },
  {
    id: 'healthcare',
    name: 'Healthcare & Wellbeing',
    shortDesc: 'Clinical policies, public health access, telemedicine, and insurance terms.',
    icon: HeartPulse,
    image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
    color: 'from-rose-600/80 to-pink-950/90',
    badge: 'Clinical & Wellness',
    disclaimer: 'Informational gap analysis only. Not medical advice. Always consult certified medical practitioners.',
    sampleTopics: [
      'Telemedicine Schedule X restricted prescription protocol',
      'Health insurance pre-existing disease waiting period waivers',
      'Public hospital vaccine booster eligibility guidelines'
    ],
    commonGaps: ['Clinical contraindications', 'Prescription regulatory schedule', 'Out-of-pocket caps']
  },
  {
    id: 'environment',
    name: 'Environment & Climate',
    shortDesc: 'Flood runoff infrastructure, air quality, pollution, and coastal defenses.',
    icon: Trees,
    image: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    color: 'from-teal-600/80 to-cyan-950/90',
    badge: 'Ecology & Disasters',
    sampleTopics: [
      'Urban stormwater drainage catchment vs 100-year flood levels',
      'Industrial effluent discharge standards and sensor compliance',
      'Groundwater aquifer recharge depletion monitoring in drought zones'
    ],
    commonGaps: ['Hydrological peak volume specs', 'Maintenance schedule audits', 'Contingency evacuation routes']
  },
  {
    id: 'employment',
    name: 'Employment & Careers',
    shortDesc: 'Job postings, cross-border remote contracts, labor rights, and hiring audits.',
    icon: Briefcase,
    image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
    color: 'from-blue-600/80 to-slate-900/90',
    badge: 'Workforce & Legal',
    sampleTopics: [
      'Cross-border remote contractor IP assignment & tax nexus',
      'Government recruitment exam syllabus changes & reservation criteria',
      'Severance policy and non-compete clause validity'
    ],
    commonGaps: ['Dual-taxation liability', 'Statutory severance formulas', 'Contract dispute arbitration venue']
  },
  {
    id: 'education',
    name: 'Education & Admissions',
    shortDesc: 'Fellowships, university admissions, exam schedules, and research grants.',
    icon: GraduationCap,
    image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80',
    color: 'from-indigo-600/80 to-violet-950/90',
    badge: 'Academia & Grants',
    sampleTopics: [
      'Global STEM Fellowship stipend taxability & visa sponsorship',
      'University credit transfer policies across international programs',
      'Postdoctoral grant renewal criteria and publication thresholds'
    ],
    commonGaps: ['Tax withholding on stipends', 'Post-award service bond rules', 'Acceptance deadline timezones']
  },
  {
    id: 'government',
    name: 'Government & Public Services',
    shortDesc: 'Citizen rights, welfare programs, identity documentation, and civic permits.',
    icon: Landmark,
    image: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&w=800&q=80',
    color: 'from-amber-600/80 to-yellow-950/90',
    badge: 'Civic & Welfare',
    sampleTopics: [
      'Senior citizen subsidized healthcare card enrollment prerequisites',
      'Municipal commercial trade license renewal timeline and inspections',
      'Right to Information response appeal mechanism and escalation ladder'
    ],
    commonGaps: ['Specific proof-of-address whitelist', 'Appellate authority contact', 'Processing fee breakdown']
  },
  {
    id: 'business',
    name: 'Business & Finance',
    shortDesc: 'MSME financing, supplier verification, cross-border tariffs, and compliance.',
    icon: TrendingUp,
    image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    color: 'from-cyan-600/80 to-slate-950/90',
    badge: 'Commerce & Markets',
    sampleTopics: [
      'Small business collateral-free credit guarantee requirements',
      'Supplier contract warranty terms and liability caps',
      'Cross-border digital services sales tax registration thresholds'
    ],
    commonGaps: ['Hidden bank processing fees', 'Audited accounts mandate', 'Indemnification carve-outs']
  },
  {
    id: 'technology',
    name: 'Technology & AI',
    shortDesc: 'API security, AI model deployment terms, data privacy, and cloud SLAs.',
    icon: Cpu,
    image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80',
    color: 'from-purple-600/80 to-indigo-950/90',
    badge: 'Tech & Security',
    sampleTopics: [
      'Enterprise LLM API data retention & model training opt-out terms',
      'Cloud SLA uptime guarantee exclusions for scheduled maintenance',
      'Zero-trust VPN client battery and telemetry disclosures'
    ],
    commonGaps: ['Data residency guarantees', 'Service credits refund mechanism', 'Third-party subprocessor lists']
  },
  {
    id: 'science',
    name: 'Research & Science',
    shortDesc: 'Peer-reviewed evidence, methodology discrepancies, and dataset reproducibility.',
    icon: Microscope,
    image: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&w=800&q=80',
    color: 'from-emerald-700/80 to-teal-950/90',
    badge: 'Evidence & Meta-Analysis',
    sampleTopics: [
      'Comparing clinical trial sample size power in two competing studies',
      'Carbon capture efficiency metrics across direct air vs flue gas',
      'Solid-state battery degradation rate under extreme temperature cycles'
    ],
    commonGaps: ['Raw dataset open availability', 'Statistical p-value significance bounds', 'Conflict-of-interest funding']
  },
  {
    id: 'transportation',
    name: 'Transportation & Travel',
    shortDesc: 'Transit safety audits, international visa transit rules, and EV charging.',
    icon: Bus,
    image: 'https://images.unsplash.com/photo-1519003722824-194d4455a60c?auto=format&fit=crop&w=800&q=80',
    color: 'from-sky-600/80 to-slate-950/90',
    badge: 'Transit & Mobility',
    sampleTopics: [
      'High-speed rail line environmental impact & land acquisition buffer',
      'EV fast-charging station universal connector and billing standards',
      'International airport airside layover transit visa exemptions'
    ],
    commonGaps: ['Luggage re-check protocol', 'Peak-hour tariff surcharges', 'Handicapped accessibility compliance']
  },
  {
    id: 'community',
    name: 'Community & Social Issues',
    shortDesc: 'Local civic facilities, NGO grants, housing affordability, and sanitation.',
    icon: Users,
    image: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?auto=format&fit=crop&w=800&q=80',
    color: 'from-orange-600/80 to-amber-950/90',
    badge: 'Civic & Non-Profit',
    sampleTopics: [
      'Community center public funding allocation & public hearing dates',
      'Affordable housing rent stabilization enforcement in urban zones',
      'Municipal waste segregation compliance and fines structure'
    ],
    commonGaps: ['Public comment period dates', 'Grievance redressal officers', 'Budget expenditure transparency']
  },
  {
    id: 'custom',
    name: 'Other / Custom Topic',
    shortDesc: 'Enter any unique real-world problem, comparison, query, or document corpus.',
    icon: Compass,
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=800&q=80',
    color: 'from-violet-600/80 to-purple-950/90',
    badge: 'Universal Research',
    sampleTopics: [
      'Contract comparison between two conflicting vendor service agreements',
      'Historical timeline discrepancies across archival records',
      'Consumer protection refund policies for defective imported electronics'
    ],
    commonGaps: ['Unstated prerequisites', 'Contradictory deadlines', 'Unverified marketing assertions']
  }
];

interface DomainGridProps {
  onSelectDomain?: (domain: DomainItem, sampleTopic?: string) => void;
  selectedDomainId?: string;
}

export const DomainGrid: React.FC<DomainGridProps> = ({ 
  onSelectDomain,
  selectedDomainId
}) => {
  const [activeDomain, setActiveDomain] = useState<DomainItem | null>(null);

  const handleDomainClick = (domain: DomainItem) => {
    setActiveDomain(domain);
  };

  const handleStartResearch = (domain: DomainItem, topic?: string) => {
    if (onSelectDomain) {
      onSelectDomain(domain, topic);
    } else if (typeof window !== 'undefined') {
      const params = new URLSearchParams();
      params.set('domain', domain.name);
      if (topic) {
        params.set('title', topic);
        params.set('q', topic);
      }
      window.history.pushState({}, '', `?${params.toString()}`);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-400 mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            Universal Multi-Domain Coverage
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Analyze Any Real-World Topic
          </h2>
          <p className="text-sm sm:text-base text-slate-400 mt-1 max-w-2xl">
            Select an area of interest or define your own custom problem. The AI cross-examines multiple sources to highlight what was left unsaid.
          </p>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {DOMAINS_DATA.map((domain) => {
          const Icon = domain.icon;
          const isSelected = selectedDomainId === domain.id || activeDomain?.id === domain.id;

          return (
            <div
              key={domain.id}
              onClick={() => handleDomainClick(domain)}
              className={`group relative rounded-2xl overflow-hidden border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                isSelected
                  ? 'border-indigo-500 ring-2 ring-indigo-500/30 scale-[1.02] shadow-xl shadow-indigo-500/10'
                  : 'border-slate-800 hover:border-slate-700 hover:scale-[1.01]'
              } bg-slate-900/60 backdrop-blur-sm`}
            >
              {/* Card Image Banner */}
              <div className="relative h-36 w-full overflow-hidden">
                <img
                  src={domain.image}
                  alt={domain.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className={`absolute inset-0 bg-gradient-to-t ${domain.color} opacity-85 group-hover:opacity-75 transition-opacity`} />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-950/40 to-slate-950" />

                {/* Badge & Icon */}
                <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md bg-black/40 backdrop-blur-md text-white border border-white/10">
                    {domain.badge}
                  </span>
                  <div className="p-1.5 rounded-lg bg-black/40 backdrop-blur-md text-white border border-white/10">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="absolute bottom-2 left-3 right-3">
                  <h3 className="text-base font-bold text-white drop-shadow-md">
                    {domain.name}
                  </h3>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <p className="text-xs text-slate-300 leading-relaxed mb-3">
                    {domain.shortDesc}
                  </p>

                  {/* Sample questions preview */}
                  <div className="space-y-1 mb-4">
                    <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      Sample Question:
                    </div>
                    <p className="text-xs text-indigo-300/90 italic line-clamp-2">
                      "{domain.sampleTopics[0]}"
                    </p>
                  </div>
                </div>

                {/* Card Action */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">
                    {domain.commonGaps.length} typical gap types
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartResearch(domain, domain.sampleTopics[0]);
                    }}
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-400 hover:text-indigo-300 group-hover:translate-x-0.5 transition-all"
                  >
                    <span>Research</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Medical Disclaimer pill if healthcare */}
              {domain.disclaimer && (
                <div className="px-3 py-1 bg-rose-950/40 border-t border-rose-900/30 flex items-center gap-1.5 text-[10px] text-rose-300">
                  <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
                  <span className="truncate">{domain.disclaimer}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Selected Domain Expanded Detail Modal / Drawer */}
      {activeDomain && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Background ambient glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
                  <activeDomain.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{activeDomain.name}</h3>
                  <p className="text-xs text-indigo-400 font-medium">{activeDomain.badge}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveDomain(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
              >
                ✕
              </button>
            </div>

            <p className="text-sm text-slate-300 mb-4">{activeDomain.shortDesc}</p>

            {/* Medical Disclaimer Alert */}
            {activeDomain.disclaimer && (
              <div className="mb-4 p-3 bg-rose-950/40 border border-rose-800/40 rounded-xl flex items-start gap-2.5 text-xs text-rose-200">
                <AlertTriangle className="w-4 h-4 text-rose-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="font-semibold block text-rose-300">Important Clinical Disclaimer</strong>
                  {activeDomain.disclaimer}
                </div>
              </div>
            )}

            {/* Sample Research Questions */}
            <div className="mb-4">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Launch Pre-Configured Benchmark Case:
              </h4>
              <div className="space-y-2">
                {activeDomain.sampleTopics.map((topic, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      const sel = activeDomain;
                      setActiveDomain(null);
                      handleStartResearch(sel, topic);
                    }}
                    className="w-full text-left p-2.5 rounded-xl bg-slate-800/70 hover:bg-indigo-600/20 border border-slate-700/60 hover:border-indigo-500/40 text-xs text-slate-200 hover:text-white flex items-center justify-between transition-all group"
                  >
                    <span className="truncate pr-2">"{topic}"</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Common Information Gaps */}
            <div className="mb-6">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Common Hidden Gaps in this Domain:
              </h4>
              <div className="flex flex-wrap gap-2">
                {activeDomain.commonGaps.map((gap, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-slate-300"
                  >
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    {gap}
                  </span>
                ))}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setActiveDomain(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  const sel = activeDomain;
                  setActiveDomain(null);
                  handleStartResearch(sel);
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 flex items-center gap-1.5 transition-all"
              >
                <span>New Research in {activeDomain.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
