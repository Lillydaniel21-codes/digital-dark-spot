from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import (
    User, ResearchProject, Source, Analysis, Finding,
    InformationGap, Conflict, OutdatedWarning, UnansweredQuestion, ChecklistItem
)
from app.schemas.schemas import AnalysisResponse, ChecklistItemSchema, ChecklistItemUpdate
from app.services.auth_service import get_current_user
from app.services.ai_service import run_ai_analysis

router = APIRouter(tags=["AI Analysis & Gap Detection"])

@router.post("/research/{research_id}/analyze", response_model=AnalysisResponse)
async def analyze_research(
    research_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(ResearchProject).filter(
        ResearchProject.id == research_id,
        ResearchProject.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Research project not found.")
        
    sources = db.query(Source).filter(
        Source.research_id == research_id,
        Source.status == "ready"
    ).all()
    
    if not sources:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No ready sources available to analyze. Please add URLs or upload documents first."
        )
        
    sources_data = [{
        "id": s.id,
        "title": s.title,
        "citation_id": s.citation_id,
        "publication_date": s.publication_date,
        "collected_at": s.collected_at,
        "raw_content": s.raw_content or ""
    } for s in sources]
    
    # Run the pipeline
    result = await run_ai_analysis(
        question=project.research_question,
        topic=project.topic,
        goal=project.goal or "",
        sources=sources_data
    )
    
    # Remove previous analysis records for clean update
    prev_analyses = db.query(Analysis).filter(Analysis.research_id == research_id).all()
    for prev in prev_analyses:
        db.delete(prev)
    db.query(ChecklistItem).filter(ChecklistItem.research_id == research_id).delete()
    db.commit()
    
    # Create Analysis record
    analysis = Analysis(
        research_id=research_id,
        executive_summary=result.get("summary", "Analysis completed."),
        limitations=result.get("limitations", "Grounding restricted to reviewed source text."),
        is_demo=result.get("is_demo", False)
    )
    db.add(analysis)
    db.commit()
    db.refresh(analysis)
    
    # Findings
    for f in result.get("findings", []):
        db.add(Finding(
            analysis_id=analysis.id,
            title=f.get("title", "Key Finding"),
            explanation=f.get("explanation", ""),
            supporting_evidence=f.get("supporting_evidence", ""),
            citation_ids=f.get("citation_ids", "SRC"),
            evidence_strength=f.get("evidence_strength", "Moderate")
        ))
        
    # Information Gaps
    for g in result.get("gaps", []):
        db.add(InformationGap(
            analysis_id=analysis.id,
            category=g.get("category", "General"),
            title=g.get("title", "Missing Detail"),
            explanation=g.get("explanation", ""),
            why_it_matters=g.get("why_it_matters", ""),
            sources_reviewed=g.get("sources_reviewed", ""),
            priority=g.get("priority", "Medium"),
            suggested_next_step=g.get("suggested_next_step", ""),
            status=g.get("status", "Not found in sources reviewed")
        ))
        
    # Conflicting Claims
    for c in result.get("conflicts", []):
        db.add(Conflict(
            analysis_id=analysis.id,
            claim_a=c.get("claim_a", ""),
            source_a_citation=c.get("source_a_citation", "SRC-A"),
            claim_b=c.get("claim_b", ""),
            source_b_citation=c.get("source_b_citation", "SRC-B"),
            explanation=c.get("explanation", ""),
            possible_reason=c.get("possible_reason", ""),
            what_to_verify=c.get("what_to_verify", "")
        ))
        
    # Outdated Warnings
    for o in result.get("outdated_warnings", []):
        db.add(OutdatedWarning(
            analysis_id=analysis.id,
            source_citation=o.get("source_citation", "SRC"),
            publication_date=o.get("publication_date"),
            flag_text=o.get("flag_text", ""),
            reason=o.get("reason", "")
        ))
        
    # Unanswered Questions
    for u in result.get("unanswered_questions", []):
        db.add(UnansweredQuestion(
            analysis_id=analysis.id,
            question=u.get("question", ""),
            importance=u.get("importance", ""),
            recommended_source=u.get("recommended_source")
        ))
        
    # Verification Checklist
    for idx, chk in enumerate(result.get("checklist", [])):
        db.add(ChecklistItem(
            research_id=research_id,
            title=chk.get("title", "Verification Task"),
            why_it_matters=chk.get("why_it_matters", ""),
            suggested_source=chk.get("suggested_source"),
            priority=chk.get("priority", "Medium"),
            is_completed=chk.get("is_completed", False),
            order_index=idx
        ))
        
    project.status = "analyzed"
    db.commit()
    db.refresh(analysis)
    
    return get_research_analysis(research_id, current_user, db)

@router.get("/research/{research_id}/analysis", response_model=AnalysisResponse)
def get_research_analysis(
    research_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(ResearchProject).filter(
        ResearchProject.id == research_id,
        ResearchProject.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Research project not found.")
        
    analysis = db.query(Analysis).filter(Analysis.research_id == research_id).order_by(Analysis.created_at.desc()).first()
    if not analysis:
        raise HTTPException(status_code=404, detail="No analysis found for this research project yet.")
        
    sources = db.query(Source).filter(Source.research_id == research_id).order_by(Source.citation_id.asc()).all()
    checklist = db.query(ChecklistItem).filter(ChecklistItem.research_id == research_id).order_by(ChecklistItem.order_index.asc()).all()
    
    return AnalysisResponse(
        id=analysis.id,
        research_id=analysis.research_id,
        executive_summary=analysis.executive_summary,
        limitations=analysis.limitations,
        is_demo=analysis.is_demo,
        created_at=analysis.created_at,
        findings=analysis.findings,
        gaps=analysis.gaps,
        conflicts=analysis.conflicts,
        outdated_warnings=analysis.outdated_warnings,
        unanswered_questions=analysis.unanswered_questions,
        sources=sources,
        checklist=checklist
    )

@router.get("/research/{research_id}/checklist", response_model=List[ChecklistItemSchema])
def get_research_checklist(
    research_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(ResearchProject).filter(
        ResearchProject.id == research_id,
        ResearchProject.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Research project not found.")
        
    return db.query(ChecklistItem).filter(ChecklistItem.research_id == research_id).order_by(ChecklistItem.order_index.asc()).all()

@router.patch("/checklist/{item_id}", response_model=ChecklistItemSchema)
def update_checklist_item(
    item_id: str,
    data: ChecklistItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    item = db.query(ChecklistItem).join(ResearchProject).filter(
        ChecklistItem.id == item_id,
        ResearchProject.user_id == current_user.id
    ).first()
    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found.")
        
    item.is_completed = data.is_completed
    db.commit()
    db.refresh(item)
    return item
