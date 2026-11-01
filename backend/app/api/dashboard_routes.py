from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import DashboardSummaryResponse, ResearchResponse
from app.services.auth_service import get_current_user
from app.models.models import User, ResearchProject, Source, InformationGap, Conflict, Analysis

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/summary", response_model=DashboardSummaryResponse)
def get_dashboard_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    projects = db.query(ResearchProject).filter(ResearchProject.user_id == current_user.id).order_by(ResearchProject.created_at.desc()).all()
    project_ids = [p.id for p in projects]
    
    total_sources = db.query(Source).filter(Source.research_id.in_(project_ids)).count() if project_ids else 0
    
    analysis_ids = [a.id for a in db.query(Analysis.id).filter(Analysis.research_id.in_(project_ids)).all()] if project_ids else []
    
    total_gaps = db.query(InformationGap).filter(InformationGap.analysis_id.in_(analysis_ids)).count() if analysis_ids else 0
    total_conflicts = db.query(Conflict).filter(Conflict.analysis_id.in_(analysis_ids)).count() if analysis_ids else 0
    
    recent_responses = []
    for p in projects[:5]:
        sources_cnt = db.query(Source).filter(Source.research_id == p.id).count()
        has_an = db.query(Analysis).filter(Analysis.research_id == p.id).first() is not None
        recent_responses.append(ResearchResponse(
            id=p.id,
            user_id=p.user_id,
            title=p.title,
            research_question=p.research_question,
            topic=p.topic,
            goal=p.goal,
            keywords=p.keywords,
            status=p.status,
            created_at=p.created_at,
            updated_at=p.updated_at,
            sources_count=sources_cnt,
            has_analysis=has_an
        ))
        
    return DashboardSummaryResponse(
        total_projects=len(projects),
        total_sources=total_sources,
        total_gaps=total_gaps,
        total_conflicts=total_conflicts,
        recent_projects=recent_responses,
        is_demo=current_user.is_demo
    )
