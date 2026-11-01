from typing import List, Optional, Any, Dict
from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime

# --- Auth Schemas ---
class RequestCodeRequest(BaseModel):
    email: str = Field(..., description="User email address")

class RequestCodeResponse(BaseModel):
    message: str
    email: str
    is_demo: bool
    demo_code: Optional[str] = None

class VerifyCodeRequest(BaseModel):
    email: str = Field(..., description="User email address")
    code: str

class UserResponse(BaseModel):
    id: str
    email: str
    is_demo: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# --- Source Schemas ---
class UrlSourceCreate(BaseModel):
    url: str
    title: Optional[str] = None

class SourceResponse(BaseModel):
    id: str
    research_id: str
    title: str
    original_url: Optional[str] = None
    source_type: str
    citation_id: str
    publication_date: Optional[str] = None
    collected_at: datetime
    status: str
    error_message: Optional[str] = None
    extracted_summary: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

# --- Analysis Sub-Schemas ---
class FindingSchema(BaseModel):
    id: Optional[str] = None
    title: str
    explanation: str
    supporting_evidence: str
    citation_ids: str
    evidence_strength: str  # Strong, Moderate, Weak, Insufficient evidence
    
    model_config = ConfigDict(from_attributes=True)

class InformationGapSchema(BaseModel):
    id: Optional[str] = None
    category: str
    title: str
    explanation: str
    why_it_matters: str
    sources_reviewed: str
    priority: str  # High, Medium, Low
    suggested_next_step: str
    status: str  # Found, Partially found, Not found in sources reviewed, Conflicting, Requires verification
    
    model_config = ConfigDict(from_attributes=True)

class ConflictSchema(BaseModel):
    id: Optional[str] = None
    claim_a: str
    source_a_citation: str
    claim_b: str
    source_b_citation: str
    explanation: str
    possible_reason: str
    what_to_verify: str
    
    model_config = ConfigDict(from_attributes=True)

class OutdatedWarningSchema(BaseModel):
    id: Optional[str] = None
    source_citation: str
    publication_date: Optional[str] = None
    collection_date: datetime
    flag_text: str
    reason: str
    
    model_config = ConfigDict(from_attributes=True)

class UnansweredQuestionSchema(BaseModel):
    id: Optional[str] = None
    question: str
    importance: str
    recommended_source: Optional[str] = None
    
    model_config = ConfigDict(from_attributes=True)

class ChecklistItemSchema(BaseModel):
    id: str
    research_id: str
    title: str
    why_it_matters: str
    suggested_source: Optional[str] = None
    priority: str
    is_completed: bool
    order_index: int
    
    model_config = ConfigDict(from_attributes=True)

class ChecklistItemUpdate(BaseModel):
    is_completed: bool

class AnalysisResponse(BaseModel):
    id: str
    research_id: str
    executive_summary: str
    limitations: Optional[str] = None
    is_demo: bool
    created_at: datetime
    findings: List[FindingSchema] = []
    gaps: List[InformationGapSchema] = []
    conflicts: List[ConflictSchema] = []
    outdated_warnings: List[OutdatedWarningSchema] = []
    unanswered_questions: List[UnansweredQuestionSchema] = []
    sources: List[SourceResponse] = []
    checklist: List[ChecklistItemSchema] = []
    
    model_config = ConfigDict(from_attributes=True)

# --- Research Project Schemas ---
class ResearchCreate(BaseModel):
    title: str
    research_question: str
    topic: Optional[str] = "General"
    location: Optional[str] = None
    goal: Optional[str] = None
    keywords: Optional[str] = None

class ResearchResponse(BaseModel):
    id: str
    user_id: str
    title: str
    research_question: str
    topic: str
    location: Optional[str] = None
    goal: Optional[str] = None
    keywords: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    sources_count: int = 0
    has_analysis: bool = False
    
    model_config = ConfigDict(from_attributes=True)

# --- Smart Search Schemas ---
class SearchSuggestionItem(BaseModel):
    id: Optional[str] = None
    query: str
    title: Optional[str] = None
    question: Optional[str] = None
    description: Optional[str] = None
    domain: str
    category: Optional[str] = None
    type: str = "suggestion"

class SearchSuggestionResponse(BaseModel):
    query: str
    suggestions: List[SearchSuggestionItem] = []
    related_questions: List[str] = []
    popular: List[str] = []
    domain_hint: Optional[str] = None

class SearchHistoryItem(BaseModel):
    id: str
    query: str
    domain: str
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class SearchHistoryCreate(BaseModel):
    query: str
    domain: Optional[str] = "General"

# --- Chatbot Schemas ---
class CitationItem(BaseModel):
    citation_id: str
    title: str
    url: Optional[str] = None
    excerpt: Optional[str] = None

class ChatQueryRequest(BaseModel):
    question: str
    conversation_id: Optional[str] = None

class ChatMessageResponse(BaseModel):
    id: str
    sender: str
    text: str
    citations: List[CitationItem] = []
    is_fallback_or_demo: bool = False
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

class ChatConversationResponse(BaseModel):
    id: str
    research_id: str
    messages: List[ChatMessageResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

# --- Dashboard Summary ---
class DashboardSummaryResponse(BaseModel):
    total_projects: int
    total_sources: int
    total_gaps: int
    total_conflicts: int
    recent_projects: List[ResearchResponse] = []
    is_demo: bool = False
