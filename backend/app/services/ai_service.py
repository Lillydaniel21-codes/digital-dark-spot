import json
import httpx
from typing import List, Dict, Any, Optional
from app.core.config import settings
from app.services.gap_engine import detect_information_gaps

async def run_ai_analysis(
    question: str,
    topic: str,
    goal: str,
    sources: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Execute AI information gap detection.
    If an external AI provider (like GEMINI_API_KEY) is configured and valid, calls the API.
    Otherwise, runs the deterministic, fully structured local Gap Detection Engine.
    """
    # Deterministic base result from the 15-step pipeline
    base_result = detect_information_gaps(question, topic, goal, sources)
    
    if not settings.GEMINI_API_KEY:
        base_result["is_demo"] = True
        return base_result
        
    try:
        # Prompt structured analysis via Gemini API
        prompt = f"""
You are the AI core of 'Digital Dark Spot', an AI-Assisted Information Gap Detection Platform.
Your goal is to inspect source materials, extract claims, and identify:
1. Missing information ("Not found in sources reviewed")
2. Conflicting claims across sources
3. Potentially outdated details
4. Key verified findings with evidence strength
5. Unanswered questions
6. Prioritized verification checklist

Research Question: {question}
Topic: {topic}
Goal: {goal}

Sources Reviewed:
{json.dumps([{
    'citation_id': s.get('citation_id'),
    'title': s.get('title'),
    'publication_date': s.get('publication_date'),
    'content': s.get('raw_content', '')[:1200]
} for s in sources], indent=2)}

Return a VALID JSON object with exactly these keys:
{{
  "summary": "Executive synthesis",
  "findings": [
    {{"title": "...", "explanation": "...", "supporting_evidence": "...", "citation_ids": "SRC-001", "evidence_strength": "Strong"}}
  ],
  "gaps": [
    {{"category": "...", "title": "...", "explanation": "...", "why_it_matters": "...", "sources_reviewed": "SRC-001", "priority": "High", "suggested_next_step": "...", "status": "Not found in sources reviewed"}}
  ],
  "conflicts": [
    {{"claim_a": "...", "source_a_citation": "SRC-001", "claim_b": "...", "source_b_citation": "SRC-002", "explanation": "...", "possible_reason": "...", "what_to_verify": "..."}}
  ],
  "outdated_warnings": [
    {{"source_citation": "SRC-002", "publication_date": "...", "flag_text": "...", "reason": "..."}}
  ],
  "unanswered_questions": [
    {{"question": "...", "importance": "...", "recommended_source": "..."}}
  ],
  "checklist": [
    {{"title": "...", "why_it_matters": "...", "suggested_source": "...", "priority": "High", "is_completed": false, "order_index": 0}}
  ],
  "limitations": "..."
}}
"""
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={settings.GEMINI_API_KEY}"
        payload = {
            "contents": [{"parts": [{"text": prompt}]}],
            "generationConfig": {"response_mime_type": "application/json"}
        }
        
        async with httpx.AsyncClient(timeout=25.0) as client:
            resp = await client.post(url, json=payload)
            if resp.status_code == 200:
                data = resp.json()
                text_content = data["candidates"][0]["content"]["parts"][0]["text"]
                parsed = json.loads(text_content)
                parsed["is_demo"] = False
                return parsed
    except Exception as e:
        print(f"Gemini API call failed or timed out: {e}. Falling back to deterministic engine.")
        
    base_result["is_demo"] = True
    return base_result
