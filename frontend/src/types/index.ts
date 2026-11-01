export interface User {
  id: string;
  email: string;
  is_demo: boolean;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ResearchProject {
  id: string;
  user_id: string;
  title: string;
  research_question: string;
  topic: string;
  location?: string;
  goal?: string;
  keywords?: string;
  status: 'draft' | 'processing' | 'analyzed' | 'completed';
  created_at: string;
  updated_at: string;
  sources_count: number;
  has_analysis: boolean;
}

export interface SearchSuggestionItem {
  id?: string;
  query: string;
  title?: string;
  domain: string;
  category?: string;
  question?: string;
  description?: string;
  type?: string;
}

export interface SearchSuggestionResponse {
  query: string;
  domain_filter?: string;
  suggestions: SearchSuggestionItem[];
  related_questions: string[];
}

export interface SearchHistoryItem {
  id: string;
  query: string;
  domain?: string;
  created_at: string;
}

export interface Source {
  id: string;
  research_id: string;
  title: string;
  original_url?: string;
  source_type: string;
  citation_id: string;
  publication_date?: string;
  collected_at: string;
  status: 'pending' | 'processing' | 'ready' | 'failed';
  error_message?: string;
  extracted_summary?: string;
}

export interface Finding {
  id?: string;
  title: string;
  explanation: string;
  supporting_evidence: string;
  citation_ids: string;
  evidence_strength: 'Strong' | 'Moderate' | 'Weak' | 'Insufficient evidence';
}

export interface InformationGap {
  id?: string;
  category: string;
  title: string;
  explanation: string;
  why_it_matters: string;
  sources_reviewed: string;
  priority: 'High' | 'Medium' | 'Low';
  suggested_next_step: string;
  status: 'Found' | 'Partially found' | 'Not found in sources reviewed' | 'Conflicting' | 'Requires verification';
}

export interface Conflict {
  id?: string;
  claim_a: string;
  source_a_citation: string;
  claim_b: string;
  source_b_citation: string;
  explanation: string;
  possible_reason: string;
  what_to_verify: string;
}

export interface OutdatedWarning {
  id?: string;
  source_citation: string;
  publication_date?: string;
  collection_date: string;
  flag_text: string;
  reason: string;
}

export interface UnansweredQuestion {
  id?: string;
  question: string;
  importance: string;
  recommended_source?: string;
}

export interface ChecklistItem {
  id: string;
  research_id: string;
  title: string;
  why_it_matters: string;
  suggested_source?: string;
  priority: 'High' | 'Medium' | 'Low';
  is_completed: boolean;
  order_index: number;
}

export interface Analysis {
  id: string;
  research_id: string;
  executive_summary: string;
  limitations?: string;
  is_demo: boolean;
  created_at: string;
  findings: Finding[];
  gaps: InformationGap[];
  conflicts: Conflict[];
  outdated_warnings: OutdatedWarning[];
  unanswered_questions: UnansweredQuestion[];
  sources: Source[];
  checklist: ChecklistItem[];
}

export interface CitationItem {
  citation_id: string;
  title: string;
  url?: string;
  excerpt?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  citations: CitationItem[];
  is_fallback_or_demo: boolean;
  created_at: string;
}

export interface DashboardSummary {
  total_projects: number;
  total_sources: number;
  total_gaps: number;
  total_conflicts: number;
  recent_projects: ResearchProject[];
  is_demo: boolean;
}

export interface HealthStatus {
  status: string;
  project: string;
  subtitle: string;
  ai_provider_configured: boolean;
  smtp_configured: boolean;
  demo_mode: boolean;
}
