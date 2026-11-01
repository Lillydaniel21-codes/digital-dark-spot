import datetime
import uuid
from sqlalchemy import Column, String, Text, Integer, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.database.session import Base

def generate_uuid():
    return str(uuid.uuid4())

class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    last_login = Column(DateTime, default=datetime.datetime.utcnow)
    is_demo = Column(Boolean, default=False)
    
    projects = relationship("ResearchProject", back_populates="user", cascade="all, delete-orphan")
    auth_tokens = relationship("AuthToken", back_populates="user", cascade="all, delete-orphan")
    search_history = relationship("SearchHistory", back_populates="user", cascade="all, delete-orphan")

class AuthCode(Base):
    __tablename__ = "auth_codes"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    email = Column(String(255), index=True, nullable=False)
    code = Column(String(10), nullable=False)
    expires_at = Column(DateTime, nullable=False)
    used = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class AuthToken(Base):
    __tablename__ = "auth_tokens"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    token = Column(String(128), unique=True, index=True, nullable=False)
    expires_at = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="auth_tokens")

class ResearchProject(Base):
    __tablename__ = "research_projects"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    research_question = Column(Text, nullable=False)
    topic = Column(String(100), default="General")
    location = Column(String(255), nullable=True)
    goal = Column(Text, nullable=True)
    keywords = Column(String(255), nullable=True)
    status = Column(String(50), default="draft")  # draft, processing, analyzed, completed
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)
    
    user = relationship("User", back_populates="projects")
    sources = relationship("Source", back_populates="research", cascade="all, delete-orphan")
    analyses = relationship("Analysis", back_populates="research", cascade="all, delete-orphan")
    checklist_items = relationship("ChecklistItem", back_populates="research", cascade="all, delete-orphan")
    conversations = relationship("ChatConversation", back_populates="research", cascade="all, delete-orphan")

class Source(Base):
    __tablename__ = "sources"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    research_id = Column(String(36), ForeignKey("research_projects.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    original_url = Column(Text, nullable=True)
    file_path = Column(Text, nullable=True)
    source_type = Column(String(50), nullable=False)  # url, pdf, docx, txt, sample
    citation_id = Column(String(20), nullable=False)   # e.g., SRC-001
    publication_date = Column(String(50), nullable=True)
    collected_at = Column(DateTime, default=datetime.datetime.utcnow)
    status = Column(String(50), default="pending")    # pending, processing, ready, failed
    error_message = Column(Text, nullable=True)
    raw_content = Column(Text, nullable=True)
    extracted_summary = Column(Text, nullable=True)
    
    research = relationship("ResearchProject", back_populates="sources")
    chunks = relationship("SourceChunk", back_populates="source", cascade="all, delete-orphan")

class SourceChunk(Base):
    __tablename__ = "source_chunks"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    source_id = Column(String(36), ForeignKey("sources.id"), nullable=False, index=True)
    chunk_index = Column(Integer, nullable=False)
    text = Column(Text, nullable=False)
    token_count = Column(Integer, default=0)
    metadata_json = Column(Text, nullable=True)  # JSON string
    
    source = relationship("Source", back_populates="chunks")

class Analysis(Base):
    __tablename__ = "analyses"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    research_id = Column(String(36), ForeignKey("research_projects.id"), nullable=False, index=True)
    executive_summary = Column(Text, nullable=False)
    limitations = Column(Text, nullable=True)
    is_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    research = relationship("ResearchProject", back_populates="analyses")
    findings = relationship("Finding", back_populates="analysis", cascade="all, delete-orphan")
    gaps = relationship("InformationGap", back_populates="analysis", cascade="all, delete-orphan")
    conflicts = relationship("Conflict", back_populates="analysis", cascade="all, delete-orphan")
    outdated_warnings = relationship("OutdatedWarning", back_populates="analysis", cascade="all, delete-orphan")
    unanswered_questions = relationship("UnansweredQuestion", back_populates="analysis", cascade="all, delete-orphan")

class Finding(Base):
    __tablename__ = "findings"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    analysis_id = Column(String(36), ForeignKey("analyses.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=False)
    supporting_evidence = Column(Text, nullable=False)
    citation_ids = Column(String(255), nullable=False)  # JSON or comma-separated e.g. SRC-001, SRC-002
    evidence_strength = Column(String(50), default="Moderate")  # Strong, Moderate, Weak, Insufficient evidence

    analysis = relationship("Analysis", back_populates="findings")

class InformationGap(Base):
    __tablename__ = "information_gaps"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    analysis_id = Column(String(36), ForeignKey("analyses.id"), nullable=False, index=True)
    category = Column(String(100), nullable=False)
    title = Column(String(255), nullable=False)
    explanation = Column(Text, nullable=False)
    why_it_matters = Column(Text, nullable=False)
    sources_reviewed = Column(Text, nullable=False)
    priority = Column(String(20), default="Medium")  # High, Medium, Low
    suggested_next_step = Column(Text, nullable=False)
    status = Column(String(50), default="Not found in sources reviewed")  # Found, Partially found, Not found in sources reviewed, Conflicting, Requires verification

    analysis = relationship("Analysis", back_populates="gaps")

class Conflict(Base):
    __tablename__ = "conflicts"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    analysis_id = Column(String(36), ForeignKey("analyses.id"), nullable=False, index=True)
    claim_a = Column(Text, nullable=False)
    source_a_citation = Column(String(50), nullable=False)
    claim_b = Column(Text, nullable=False)
    source_b_citation = Column(String(50), nullable=False)
    explanation = Column(Text, nullable=False)
    possible_reason = Column(Text, nullable=False)
    what_to_verify = Column(Text, nullable=False)

    analysis = relationship("Analysis", back_populates="conflicts")

class OutdatedWarning(Base):
    __tablename__ = "outdated_warnings"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    analysis_id = Column(String(36), ForeignKey("analyses.id"), nullable=False, index=True)
    source_citation = Column(String(50), nullable=False)
    publication_date = Column(String(50), nullable=True)
    collection_date = Column(DateTime, default=datetime.datetime.utcnow)
    flag_text = Column(Text, nullable=False)
    reason = Column(Text, nullable=False)

    analysis = relationship("Analysis", back_populates="outdated_warnings")

class UnansweredQuestion(Base):
    __tablename__ = "unanswered_questions"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    analysis_id = Column(String(36), ForeignKey("analyses.id"), nullable=False, index=True)
    question = Column(Text, nullable=False)
    importance = Column(Text, nullable=False)
    recommended_source = Column(String(255), nullable=True)

    analysis = relationship("Analysis", back_populates="unanswered_questions")

class ChecklistItem(Base):
    __tablename__ = "checklist_items"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    research_id = Column(String(36), ForeignKey("research_projects.id"), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    why_it_matters = Column(Text, nullable=False)
    suggested_source = Column(String(255), nullable=True)
    priority = Column(String(20), default="Medium")  # High, Medium, Low
    is_completed = Column(Boolean, default=False)
    order_index = Column(Integer, default=0)

    research = relationship("ResearchProject", back_populates="checklist_items")

class ChatConversation(Base):
    __tablename__ = "chat_conversations"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    research_id = Column(String(36), ForeignKey("research_projects.id"), nullable=False, index=True)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    research = relationship("ResearchProject", back_populates="conversations")
    messages = relationship("ChatMessage", back_populates="conversation", cascade="all, delete-orphan", order_by="ChatMessage.created_at")

class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    conversation_id = Column(String(36), ForeignKey("chat_conversations.id"), nullable=False, index=True)
    sender = Column(String(20), nullable=False)  # user, assistant
    text = Column(Text, nullable=False)
    citations_json = Column(Text, nullable=True)  # JSON list of {citation_id, title, url, excerpt}
    is_fallback_or_demo = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    conversation = relationship("ChatConversation", back_populates="messages")

class SearchHistory(Base):
    __tablename__ = "search_history"
    
    id = Column(String(36), primary_key=True, default=generate_uuid)
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    query = Column(String(500), nullable=False)
    domain = Column(String(100), default="General")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="search_history")
