from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import ResearchCreate, ResearchResponse
from app.services.auth_service import get_current_user
from app.services.sample_data import seed_sample_research_project
from app.models.models import User, ResearchProject, Source, Analysis

router = APIRouter(prefix="/research", tags=["Research Projects"])

@router.post("", response_model=ResearchResponse)
def create_research(
    data: ResearchCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = ResearchProject(
        user_id=current_user.id,
        title=data.title.strip(),
        research_question=data.research_question.strip(),
        topic=data.topic or "General",
        location=data.location,
        goal=data.goal,
        keywords=data.keywords,
        status="draft"
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    
    return ResearchResponse(
        id=project.id,
        user_id=project.user_id,
        title=project.title,
        research_question=project.research_question,
        topic=project.topic,
        location=project.location,
        goal=project.goal,
        keywords=project.keywords,
        status=project.status,
        created_at=project.created_at,
        updated_at=project.updated_at,
        sources_count=0,
        has_analysis=False
    )

@router.get("", response_model=List[ResearchResponse])
def list_research(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    projects = db.query(ResearchProject).filter(
        ResearchProject.user_id == current_user.id
    ).order_by(ResearchProject.created_at.desc()).all()
    
    res = []
    for p in projects:
        sources_cnt = db.query(Source).filter(Source.research_id == p.id).count()
        has_an = db.query(Analysis).filter(Analysis.research_id == p.id).first() is not None
        res.append(ResearchResponse(
            id=p.id,
            user_id=p.user_id,
            title=p.title,
            research_question=p.research_question,
            topic=p.topic,
            location=p.location,
            goal=p.goal,
            keywords=p.keywords,
            status=p.status,
            created_at=p.created_at,
            updated_at=p.updated_at,
            sources_count=sources_cnt,
            has_analysis=has_an
        ))
    return res

@router.post("/load-sample", response_model=ResearchResponse)
def load_sample_project(
    domain: str = "agriculture",
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Seed ready-to-use real-world research benchmarks across multiple domains."""
    project = seed_sample_research_project(db, current_user.id, domain=domain)
    sources_cnt = db.query(Source).filter(Source.research_id == project.id).count()
    return ResearchResponse(
        id=project.id,
        user_id=project.user_id,
        title=project.title,
        research_question=project.research_question,
        topic=project.topic,
        location=project.location,
        goal=project.goal,
        keywords=project.keywords,
        status=project.status,
        created_at=project.created_at,
        updated_at=project.updated_at,
        sources_count=sources_cnt,
        has_analysis=True
    )

@router.get("/{research_id}", response_model=ResearchResponse)
def get_research_detail(
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
        
    sources_cnt = db.query(Source).filter(Source.research_id == project.id).count()
    has_an = db.query(Analysis).filter(Analysis.research_id == project.id).first() is not None
    
    return ResearchResponse(
        id=project.id,
        user_id=project.user_id,
        title=project.title,
        research_question=project.research_question,
        topic=project.topic,
        location=project.location,
        goal=project.goal,
        keywords=project.keywords,
        status=project.status,
        created_at=project.created_at,
        updated_at=project.updated_at,
        sources_count=sources_cnt,
        has_analysis=has_an
    )

@router.delete("/{research_id}")
def delete_research(
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
        
    db.delete(project)
    db.commit()
    return {"message": "Research project deleted successfully."}
