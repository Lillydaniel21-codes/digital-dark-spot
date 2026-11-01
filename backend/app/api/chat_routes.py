import json
import datetime
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.models.models import User, ResearchProject, ChatConversation, ChatMessage
from app.schemas.schemas import ChatQueryRequest, ChatMessageResponse, ChatConversationResponse, CitationItem
from app.services.auth_service import get_current_user
from app.services.chatbot_service import generate_chatbot_response

router = APIRouter(prefix="/research", tags=["AI Research Assistant Chatbot"])

def get_or_create_conversation(db: Session, research_id: str, user_id: str) -> ChatConversation:
    conv = db.query(ChatConversation).filter(
        ChatConversation.research_id == research_id,
        ChatConversation.user_id == user_id
    ).first()
    if not conv:
        conv = ChatConversation(
            research_id=research_id,
            user_id=user_id
        )
        db.add(conv)
        db.commit()
        db.refresh(conv)
    return conv

@router.post("/{research_id}/chat", response_model=ChatMessageResponse)
async def post_chat_query(
    research_id: str,
    data: ChatQueryRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    project = db.query(ResearchProject).filter(
        ResearchProject.id == research_id,
        ResearchProject.user_id == current_user.id
    ).first()
    if not project:
        raise HTTPException(status_code=404, detail="Research project not found.")
        
    conv = get_or_create_conversation(db, research_id, current_user.id)
    
    # Save User message
    user_msg = ChatMessage(
        conversation_id=conv.id,
        sender="user",
        text=data.question.strip(),
        is_fallback_or_demo=False
    )
    db.add(user_msg)
    conv.updated_at = datetime.datetime.utcnow()
    db.commit()
    
    # Generate Assistant response
    reply_data = await generate_chatbot_response(db, research_id, data.question.strip(), conv)
    
    citations_list = reply_data.get("citations", [])
    citations_json_str = json.dumps(citations_list) if citations_list else None
    
    bot_msg = ChatMessage(
        conversation_id=conv.id,
        sender="assistant",
        text=reply_data.get("text", ""),
        citations_json=citations_json_str,
        is_fallback_or_demo=reply_data.get("is_demo", False)
    )
    db.add(bot_msg)
    db.commit()
    db.refresh(bot_msg)
    
    parsed_citations = [
        CitationItem(
            citation_id=c.get("citation_id", "SRC"),
            title=c.get("title", ""),
            url=c.get("url"),
            excerpt=c.get("excerpt")
        ) for c in citations_list
    ]
    
    return ChatMessageResponse(
        id=bot_msg.id,
        sender=bot_msg.sender,
        text=bot_msg.text,
        citations=parsed_citations,
        is_fallback_or_demo=bot_msg.is_fallback_or_demo,
        created_at=bot_msg.created_at
    )

@router.get("/{research_id}/chat/history", response_model=ChatConversationResponse)
def get_chat_history(
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
        
    conv = get_or_create_conversation(db, research_id, current_user.id)
    
    messages = db.query(ChatMessage).filter(ChatMessage.conversation_id == conv.id).order_by(ChatMessage.created_at.asc()).all()
    
    res_messages = []
    for m in messages:
        cits = []
        if m.citations_json:
            try:
                raw_cits = json.loads(m.citations_json)
                cits = [CitationItem(
                    citation_id=c.get("citation_id", "SRC"),
                    title=c.get("title", ""),
                    url=c.get("url"),
                    excerpt=c.get("excerpt")
                ) for c in raw_cits]
            except Exception:
                pass
                
        res_messages.append(ChatMessageResponse(
            id=m.id,
            sender=m.sender,
            text=m.text,
            citations=cits,
            is_fallback_or_demo=m.is_fallback_or_demo,
            created_at=m.created_at
        ))
        
    return ChatConversationResponse(
        id=conv.id,
        research_id=research_id,
        messages=res_messages
    )

@router.delete("/{research_id}/chat/history")
def clear_chat_history(
    research_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    conv = db.query(ChatConversation).filter(
        ChatConversation.research_id == research_id,
        ChatConversation.user_id == current_user.id
    ).first()
    if conv:
        db.query(ChatMessage).filter(ChatMessage.conversation_id == conv.id).delete()
        db.commit()
    return {"message": "Chat history cleared successfully."}
