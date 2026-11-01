import uuid
import datetime
from pathlib import Path
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.security import validate_safe_url
from app.database.session import get_db
from app.models.models import User, ResearchProject, Source, SourceChunk
from app.schemas.schemas import SourceResponse, UrlSourceCreate
from app.services.auth_service import get_current_user
from app.services.document_extractor import (
    extract_from_pdf, extract_from_docx, extract_from_txt,
    extract_from_url, chunk_text, clean_and_normalize_text
)

router = APIRouter(tags=["Source Management"])

def assign_next_citation_id(db: Session, research_id: str) -> str:
    count = db.query(Source).filter(Source.research_id == research_id).count()
    return f"SRC-{count + 1:03d}"

@router.post("/research/{research_id}/sources/url", response_model=SourceResponse)
def add_url_source(
    research_id: str,
    data: UrlSourceCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(ResearchProject).filter(
        ResearchProject.id == research_id,
        ResearchProject.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Research project not found.")
        
    validate_safe_url(data.url)
    
    cit_id = assign_next_citation_id(db, research_id)
    source = Source(
        research_id=research_id,
        title=data.title.strip() if (data.title and data.title.strip()) else data.url,
        original_url=data.url.strip(),
        source_type="url",
        citation_id=cit_id,
        status="processing"
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    
    # Process extraction synchronously
    try:
        content, extracted_title, pub_date = extract_from_url(data.url)
        if not content:
            source.status = "failed"
            source.error_message = "No readable text content could be extracted from this URL."
        else:
            source.status = "ready"
            source.raw_content = content
            if extracted_title and (not data.title or data.title.strip() == ""):
                source.title = extracted_title
            source.publication_date = pub_date
            source.extracted_summary = content[:250] + "..." if len(content) > 250 else content
            
            # Create chunks
            chunks = chunk_text(content)
            for idx, ch_text in enumerate(chunks):
                ch = SourceChunk(
                    source_id=source.id,
                    chunk_index=idx,
                    text=ch_text,
                    token_count=len(ch_text.split()),
                    metadata_json='{"citation": "' + cit_id + '"}'
                )
                db.add(ch)
    except Exception as e:
        source.status = "failed"
        source.error_message = f"Extraction failed: {str(e)}"
        
    db.commit()
    db.refresh(source)
    return source

@router.post("/research/{research_id}/sources/upload", response_model=SourceResponse)
async def upload_document_source(
    research_id: str,
    file: UploadFile = File(...),
    title: str = Form(None),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(ResearchProject).filter(
        ResearchProject.id == research_id,
        ResearchProject.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Research project not found.")
        
    filename = file.filename or "uploaded_document"
    ext = Path(filename).suffix.lower()
    if ext not in settings.ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file format '{ext}'. Allowed formats: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
        
    content_bytes = await file.read()
    if len(content_bytes) > settings.MAX_UPLOAD_SIZE_BYTES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File exceeds maximum allowed limit of {settings.MAX_UPLOAD_SIZE_BYTES // (1024*1024)}MB."
        )
        
    # Save file securely
    unique_filename = f"{uuid.uuid4().hex}_{filename}"
    saved_path = settings.UPLOAD_DIR / unique_filename
    with open(saved_path, "wb") as f:
        f.write(content_bytes)
        
    cit_id = assign_next_citation_id(db, research_id)
    doc_title = title.strip() if (title and title.strip()) else filename
    
    source = Source(
        research_id=research_id,
        title=doc_title,
        file_path=str(saved_path),
        source_type=ext.replace(".", ""),
        citation_id=cit_id,
        status="processing"
    )
    db.add(source)
    db.commit()
    db.refresh(source)
    
    # Extract text based on extension
    try:
        raw_text = ""
        meta_info = []
        if ext == ".pdf":
            raw_text, meta_info = extract_from_pdf(saved_path)
        elif ext == ".docx":
            raw_text, meta_info = extract_from_docx(saved_path)
        elif ext == ".txt":
            raw_text, meta_info = extract_from_txt(saved_path)
            
        if not raw_text.strip():
            source.status = "failed"
            source.error_message = "No readable text could be parsed from this document."
        else:
            source.status = "ready"
            source.raw_content = raw_text
            source.extracted_summary = raw_text[:250] + "..." if len(raw_text) > 250 else raw_text
            
            # Create chunks
            chunks = chunk_text(raw_text)
            for idx, ch_text in enumerate(chunks):
                ch = SourceChunk(
                    source_id=source.id,
                    chunk_index=idx,
                    text=ch_text,
                    token_count=len(ch_text.split()),
                    metadata_json='{"citation": "' + cit_id + '"}'
                )
                db.add(ch)
    except Exception as e:
        source.status = "failed"
        source.error_message = f"Document extraction error: {str(e)}"
        
    db.commit()
    db.refresh(source)
    return source

@router.get("/research/{research_id}/sources", response_model=List[SourceResponse])
def get_research_sources(
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
        
    return db.query(Source).filter(Source.research_id == research_id).order_by(Source.collected_at.asc()).all()

@router.delete("/sources/{source_id}")
def delete_source(
    source_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    source = db.query(Source).join(ResearchProject).filter(
        Source.id == source_id,
        ResearchProject.user_id == current_user.id
    ).first()
    if not source:
        raise HTTPException(status_code=404, detail="Source not found.")
        
    # Delete uploaded file if present
    if source.file_path:
        try:
            p = Path(source.file_path)
            if p.exists():
                p.unlink()
        except Exception:
            pass
            
    db.delete(source)
    db.commit()
    return {"message": "Source removed successfully."}
