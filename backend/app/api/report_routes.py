import io
import csv
from fastapi import APIRouter, Depends, HTTPException, Response
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import User, ResearchProject, Source, Analysis, ChecklistItem
from app.services.auth_service import get_current_user
from app.services.pdf_report_service import generate_pdf_report

router = APIRouter(prefix="/research", tags=["Research Reports"])

def fetch_full_report_data(research_id: str, user_id: str, db: Session) -> dict:
    project = db.query(ResearchProject).filter(
        ResearchProject.id == research_id,
        ResearchProject.user_id == user_id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Research project not found.")
        
    analysis = db.query(Analysis).filter(Analysis.research_id == research_id).order_by(Analysis.created_at.desc()).first()
    sources = db.query(Source).filter(Source.research_id == research_id).order_by(Source.citation_id.asc()).all()
    checklist = db.query(ChecklistItem).filter(ChecklistItem.research_id == research_id).order_by(ChecklistItem.order_index.asc()).all()
    
    analysis_data = {}
    if analysis:
        analysis_data = {
            "id": analysis.id,
            "executive_summary": analysis.executive_summary,
            "limitations": analysis.limitations,
            "is_demo": analysis.is_demo,
            "created_at": analysis.created_at.isoformat(),
            "findings": [{
                "title": f.title,
                "explanation": f.explanation,
                "supporting_evidence": f.supporting_evidence,
                "citation_ids": f.citation_ids,
                "evidence_strength": f.evidence_strength
            } for f in analysis.findings],
            "gaps": [{
                "category": g.category,
                "title": g.title,
                "explanation": g.explanation,
                "why_it_matters": g.why_it_matters,
                "sources_reviewed": g.sources_reviewed,
                "priority": g.priority,
                "suggested_next_step": g.suggested_next_step,
                "status": g.status
            } for g in analysis.gaps],
            "conflicts": [{
                "claim_a": c.claim_a,
                "source_a_citation": c.source_a_citation,
                "claim_b": c.claim_b,
                "source_b_citation": c.source_b_citation,
                "explanation": c.explanation,
                "possible_reason": c.possible_reason,
                "what_to_verify": c.what_to_verify
            } for c in analysis.conflicts],
            "outdated_warnings": [{
                "source_citation": o.source_citation,
                "publication_date": o.publication_date,
                "collection_date": o.collection_date.isoformat(),
                "flag_text": o.flag_text,
                "reason": o.reason
            } for o in analysis.outdated_warnings],
            "unanswered_questions": [{
                "question": u.question,
                "importance": u.importance,
                "recommended_source": u.recommended_source
            } for u in analysis.unanswered_questions]
        }
        
    sources_data = [{
        "id": s.id,
        "title": s.title,
        "original_url": s.original_url,
        "source_type": s.source_type,
        "citation_id": s.citation_id,
        "publication_date": s.publication_date,
        "collected_at": s.collected_at.isoformat(),
        "status": s.status,
        "extracted_summary": s.extracted_summary
    } for s in sources]
    
    checklist_data = [{
        "id": chk.id,
        "title": chk.title,
        "why_it_matters": chk.why_it_matters,
        "suggested_source": chk.suggested_source,
        "priority": chk.priority,
        "is_completed": chk.is_completed,
        "order_index": chk.order_index
    } for chk in checklist]
    
    return {
        "id": project.id,
        "title": project.title,
        "research_question": project.research_question,
        "topic": project.topic,
        "goal": project.goal,
        "keywords": project.keywords,
        "status": project.status,
        "created_at": project.created_at.isoformat(),
        "analysis": analysis_data,
        "sources": sources_data,
        "checklist": checklist_data
    }

@router.get("/{research_id}/report")
def get_research_report(
    research_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    return fetch_full_report_data(research_id, current_user.id, db)

@router.get("/{research_id}/report/pdf")
def download_pdf_report(
    research_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    data = fetch_full_report_data(research_id, current_user.id, db)
    pdf_buffer = generate_pdf_report(data)
    
    safe_title = "".join(c for c in data.get("title", "report") if c.isalnum() or c in ("-", "_")).rstrip()
    filename = f"DigitalDarkSpot_{safe_title}_{research_id[:8]}.pdf"
    
    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )

@router.get("/{research_id}/report/csv")
def download_csv_report(
    research_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    data = fetch_full_report_data(research_id, current_user.id, db)
    analysis = data.get("analysis") or {}
    
    output = io.StringIO()
    writer = csv.writer(output)
    
    # Metadata
    writer.writerow(["AI INFORMATION GAP DETECTION PLATFORM - AUDIT REPORT"])
    writer.writerow(["Title", data.get("title")])
    writer.writerow(["Research Question", data.get("research_question")])
    writer.writerow(["Topic Domain", data.get("topic")])
    writer.writerow(["Status", data.get("status")])
    writer.writerow(["Created At", data.get("created_at")])
    writer.writerow([])
    
    # Executive Summary
    writer.writerow(["EXECUTIVE SUMMARY"])
    writer.writerow([analysis.get("executive_summary", "")])
    writer.writerow([])
    
    # Information Gaps
    writer.writerow(["INFORMATION GAPS (MISSING DETAILS)"])
    writer.writerow(["Category", "Title", "Status", "Priority", "Explanation", "Why It Matters", "Suggested Next Step", "Sources Reviewed"])
    for g in analysis.get("gaps", []):
        writer.writerow([
            g.get("category"), g.get("title"), g.get("status"), g.get("priority"),
            g.get("explanation"), g.get("why_it_matters"), g.get("suggested_next_step"), g.get("sources_reviewed")
        ])
    writer.writerow([])
    
    # Conflicting Claims
    writer.writerow(["CONFLICTING CLAIMS ACROSS SOURCES"])
    writer.writerow(["Claim A", "Source A Citation", "Claim B", "Source B Citation", "Contradiction Explanation", "Possible Reason", "What To Verify"])
    for c in analysis.get("conflicts", []):
        writer.writerow([
            c.get("claim_a"), c.get("source_a_citation"), c.get("claim_b"), c.get("source_b_citation"),
            c.get("explanation"), c.get("possible_reason"), c.get("what_to_verify")
        ])
    writer.writerow([])
    
    # Verification Checklist
    writer.writerow(["PRIORITIZED VERIFICATION CHECKLIST"])
    writer.writerow(["Task Title", "Priority", "Completed", "Why It Matters", "Suggested Source"])
    for chk in data.get("checklist", []):
        writer.writerow([
            chk.get("title"), chk.get("priority"), "Yes" if chk.get("is_completed") else "No",
            chk.get("why_it_matters"), chk.get("suggested_source")
        ])
    writer.writerow([])
    
    safe_title = "".join(c for c in data.get("title", "report") if c.isalnum() or c in ("-", "_")).rstrip()
    filename = f"InformationGapAudit_{safe_title}_{research_id[:8]}.csv"
    
    output.seek(0)
    return StreamingResponse(
        io.BytesIO(output.getvalue().encode('utf-8')),
        media_type="text/csv",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'}
    )
