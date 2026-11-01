import json
import httpx
from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from app.core.config import settings
from app.models.models import (
    ResearchProject, Source, SourceChunk, Analysis,
    Finding, InformationGap, Conflict, ChecklistItem,
    ChatConversation, ChatMessage
)

def search_relevant_chunks(db: Session, research_id: str, query: str, top_k: int = 3) -> List[Dict[str, Any]]:
    """
    Retrieval step: Simple lexical keyword match across stored chunks for the research project.
    """
    query_tokens = [t.lower() for t in query.split() if len(t) > 3]
    sources = db.query(Source).filter(Source.research_id == research_id).all()
    source_ids = [s.id for s in sources]
    source_map = {s.id: s for s in sources}
    
    chunks = db.query(SourceChunk).filter(SourceChunk.source_id.in_(source_ids)).all() if source_ids else []
    
    scored_chunks = []
    for chunk in chunks:
        score = 0
        text_lower = chunk.text.lower()
        for token in query_tokens:
            if token in text_lower:
                score += 1
        src = source_map.get(chunk.source_id)
        scored_chunks.append({
            "chunk_id": chunk.id,
            "text": chunk.text,
            "score": score,
            "citation_id": src.citation_id if src else "SRC",
            "title": src.title if src else "Source",
            "url": src.original_url if src else None
        })
        
    scored_chunks.sort(key=lambda x: x["score"], reverse=True)
    return scored_chunks[:top_k]

async def generate_chatbot_response(
    db: Session,
    research_id: str,
    user_query: str,
    conversation: ChatConversation
) -> Dict[str, Any]:
    """
    Generate a grounded response for the AI Research Assistant.
    """
    project = db.query(ResearchProject).filter(ResearchProject.id == research_id).first()
    analysis = db.query(Analysis).filter(Analysis.research_id == research_id).order_by(Analysis.created_at.desc()).first()
    sources = db.query(Source).filter(Source.research_id == research_id).all()
    
    # Retrieve top chunks
    relevant_chunks = search_relevant_chunks(db, research_id, user_query, top_k=3)
    
    # Gather structured context
    findings = db.query(Finding).filter(Finding.analysis_id == analysis.id).all() if analysis else []
    gaps = db.query(InformationGap).filter(InformationGap.analysis_id == analysis.id).all() if analysis else []
    conflicts = db.query(Conflict).filter(Conflict.analysis_id == analysis.id).all() if analysis else []
    checklist = db.query(ChecklistItem).filter(ChecklistItem.research_id == research_id).all()
    
    citations = []
    for c in relevant_chunks:
        if c["score"] > 0 or len(relevant_chunks) == 1:
            citations.append({
                "citation_id": c["citation_id"],
                "title": c["title"],
                "url": c["url"],
                "excerpt": c["text"][:160] + "..."
            })
            
    q_lower = user_query.lower()
    
    # Handle dedicated quick-action queries deterministically or when Gemini API is not configured
    if not settings.GEMINI_API_KEY:
        # Grounded rule-based response using stored structured records
        if any(w in q_lower for w in ["missing", "gap", "absent", "omitted"]):
            if gaps:
                gap_items = "\n".join([f"• **{g.title}** ({g.category}): {g.explanation} [Status: *{g.status}*]" for g in gaps])
                ans_text = (
                    f"Based on the analysis of your reviewed sources, the following information gaps were identified:\n\n"
                    f"{gap_items}\n\n"
                    f"**Suggested Next Action:** Priority should be given to resolving high-priority gaps by contacting official administrators."
                )
            else:
                ans_text = "I could not find sufficient evidence in the sources reviewed to identify missing information."
                
        elif any(w in q_lower for w in ["conflict", "disagree", "contradict", "difference"]):
            if conflicts:
                conflict_items = "\n".join([
                    f"• **Conflict**: Claim A from [{c.source_a_citation}] states: \"{c.claim_a}\" whereas Claim B from [{c.source_b_citation}] states: \"{c.claim_b}\".\n"
                    f"  *Reasoning*: {c.explanation}\n"
                    f"  *Action*: {c.what_to_verify}" for c in conflicts
                ])
                ans_text = f"Here are the conflicting claims detected across your sources:\n\n{conflict_items}"
            else:
                ans_text = "No direct conflicting claims were detected among the sources reviewed."
                
        elif any(w in q_lower for w in ["outdated", "old", "expired", "stale"]):
            outdated_warns = analysis.outdated_warnings if analysis else []
            if outdated_warns:
                items = "\n".join([f"• [{w.source_citation}] ({w.publication_date or 'Undated'}): {w.flag_text} - *{w.reason}*" for w in outdated_warns])
                ans_text = f"Potentially outdated information flagged:\n\n{items}"
            else:
                ans_text = "No explicitly outdated dates or cycles were detected in the reviewed materials."
                
        elif any(w in q_lower for w in ["verify", "checklist", "next step", "what to do"]):
            if checklist:
                items = "\n".join([f"{idx+1}. [{'x' if c.is_completed else ' '}] **{c.title}** (Priority: {c.priority})\n   *Why*: {c.why_it_matters}\n   *Source*: {c.suggested_source or 'Official Portal'}" for idx, c in enumerate(checklist)])
                ans_text = f"Here is your prioritized verification checklist:\n\n{items}"
            else:
                ans_text = "No verification checklist has been generated yet. Please run research analysis first."
                
        elif any(w in q_lower for w in ["summary", "summarize", "overview", "findings"]):
            summary_txt = analysis.executive_summary if analysis else "No summary available."
            findings_txt = "\n".join([f"• **{f.title}**: {f.explanation} [{f.citation_ids}] (Strength: {f.evidence_strength})" for f in findings])
            ans_text = f"**Executive Summary:**\n{summary_txt}\n\n**Key Findings:**\n{findings_txt}"
            
        else:
            # Check if relevant text was retrieved
            if relevant_chunks and relevant_chunks[0]["score"] > 0:
                top = relevant_chunks[0]
                ans_text = (
                    f"According to **{top['title']}** [{top['citation_id']}]:\n\n"
                    f"> \"{top['text'][:350]}...\"\n\n"
                    f"*(Note: Verify this against current official guidelines before making commitments.)*"
                )
            else:
                ans_text = (
                    "I could not find sufficient evidence in the sources reviewed to answer this question. "
                    "I recommend checking the official issuing organization or primary portal directly."
                )
                
        return {
            "text": ans_text,
            "citations": citations,
            "is_demo": True
        }

    # If GEMINI_API_KEY is configured, run grounded conversational generation
    try:
        context_prompt = f"""
You are the AI Research Assistant for 'Digital Dark Spot'.
Research Question: {project.title if project else ''} - {project.research_question if project else ''}
Executive Summary: {analysis.executive_summary if analysis else ''}

Key Findings:
{json.dumps([f.title + ': ' + f.explanation + ' [' + f.citation_ids + ']' for f in findings])}

Information Gaps (Missing details):
{json.dumps([g.title + ' (' + g.status + '): ' + g.explanation for g in gaps])}

Conflicts:
{json.dumps([c.explanation + ' [A: ' + c.source_a_citation + ', B: ' + c.source_b_citation + ']' for c in conflicts])}

Retrieved Source Text:
{json.dumps([f"[{c['citation_id']}] {c['title']}: {c['text'][:600]}" for c in relevant_chunks])}

User Question: {user_query}

Guidelines:
1. Base your answer STRICTLY on the provided source excerpts and analysis findings.
2. If the answer is not supported by the reviewed sources, state:
   "I could not find sufficient evidence in the sources reviewed to answer this question."
   and suggest what the user should verify next.
3. Include citation tags like [SRC-001], [SRC-002].
4. Distinguish clearly between facts from sources and AI recommendations.
"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {"contents": [{"parts": [{"text": context_prompt}]}]}
        
        async with httpx.AsyncClient(timeout=20.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                reply_text = data["candidates"][0]["content"]["parts"][0]["text"]
                return {
                    "text": reply_text,
                    "citations": citations,
                    "is_demo": False
                }
    except Exception as e:
        print(f"Gemini chat error: {e}")
        
    return {
        "text": "I could not find sufficient evidence in the sources reviewed to answer this question. I recommend checking the official issuing organization or primary portal directly.",
        "citations": citations,
        "is_demo": True
    }
