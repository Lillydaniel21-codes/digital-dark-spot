from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.schemas.schemas import RequestCodeRequest, RequestCodeResponse, VerifyCodeRequest, TokenResponse, UserResponse
from app.services.auth_service import request_login_code, verify_login_code, get_current_user
from app.models.models import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/request-code", response_model=RequestCodeResponse)
def request_code(data: RequestCodeRequest, db: Session = Depends(get_db)):
    result = request_login_code(db, data.email)
    return result

@router.post("/verify-code", response_model=TokenResponse)
def verify_code(data: VerifyCodeRequest, db: Session = Depends(get_db)):
    result = verify_login_code(db, data.email, data.code)
    return result

@router.post("/demo-login", response_model=TokenResponse)
def demo_login(db: Session = Depends(get_db)):
    """1-Click instantaneous local demo access without email friction."""
    result = verify_login_code(db, "demo@digitaldarkspot.io", "123456")
    return result

@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
