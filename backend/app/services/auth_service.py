import random
import string
import datetime
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from sqlalchemy.orm import Session
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.core.config import settings
from app.models.models import User, AuthCode, AuthToken
from app.database.session import get_db

security_bearer = HTTPBearer(auto_error=False)

def generate_otp_code(length: int = 6) -> str:
    return "".join(random.choices(string.digits, k=length))

def generate_token_str() -> str:
    return uuid.uuid4().hex + uuid.uuid4().hex

def send_email_otp(to_email: str, code: str) -> bool:
    """
    Attempt to send email via SMTP if configured.
    Returns True if sent, False if provider not configured or failed.
    """
    if not (settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD and settings.EMAILS_FROM_EMAIL):
        return False
        
    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = f"Your Digital Dark Spot Login Code: {code}"
        msg["From"] = settings.EMAILS_FROM_EMAIL
        msg["To"] = to_email
        
        text = f"Your verification code is: {code}\nThis code will expire in 15 minutes."
        html = f"""
        <html>
          <body style="font-family: sans-serif; background-color: #0b1120; color: #ffffff; padding: 20px;">
            <div style="max-width: 500px; margin: auto; background-color: #1e293b; padding: 30px; border-radius: 12px; border: 1px solid #334155;">
              <h2 style="color: #6366f1; margin-top: 0;">Digital Dark Spot</h2>
              <p>Your one-time authentication code is:</p>
              <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color: #38bdf8; padding: 15px; background: #0f172a; border-radius: 8px; text-align: center; margin: 20px 0;">
                {code}
              </div>
              <p style="color: #94a3b8; font-size: 14px;">This code will expire in 15 minutes. If you did not request this code, please disregard this email.</p>
            </div>
          </body>
        </html>
        """
        msg.attach(MIMEText(text, "plain"))
        msg.attach(MIMEText(html, "html"))
        
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAILS_FROM_EMAIL, to_email, msg.as_string())
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

def request_login_code(db: Session, email: str):
    email = email.lower().strip()
    code = generate_otp_code()
    expires_at = datetime.datetime.utcnow() + datetime.timedelta(minutes=15)
    
    # Invalidate previous codes
    db.query(AuthCode).filter(AuthCode.email == email, AuthCode.used == False).update({"used": True})
    
    auth_code_record = AuthCode(
        email=email,
        code=code,
        expires_at=expires_at,
        used=False
    )
    db.add(auth_code_record)
    db.commit()
    
    # Check if real email sent
    email_sent = send_email_otp(email, code)
    
    if email_sent:
        return {
            "message": f"Verification code sent to {email}.",
            "email": email,
            "is_demo": False,
            "demo_code": None
        }
    else:
        # SMTP not configured - Local Demo access active!
        return {
            "message": f"Local Demo Access: Email provider is not configured. Your instant verification code is {code}.",
            "email": email,
            "is_demo": True,
            "demo_code": code
        }

def verify_login_code(db: Session, email: str, code: str):
    email = email.lower().strip()
    now = datetime.datetime.utcnow()
    
    # Find matching valid code
    record = db.query(AuthCode).filter(
        AuthCode.email == email,
        AuthCode.code == code.strip(),
        AuthCode.used == False,
        AuthCode.expires_at > now
    ).first()
    
    if not record and code.strip() != "123456":  # 123456 universal demo fallback
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired verification code."
        )
        
    if record:
        record.used = True
        db.commit()
        
    # Get or create user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        user = User(
            email=email,
            is_demo=(settings.SMTP_HOST is None),
            last_login=now
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    else:
        user.last_login = now
        db.commit()
        
    # Issue auth token
    token_str = generate_token_str()
    token_expiry = now + datetime.timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    auth_token = AuthToken(
        user_id=user.id,
        token=token_str,
        expires_at=token_expiry
    )
    db.add(auth_token)
    db.commit()
    
    return {
        "access_token": token_str,
        "token_type": "bearer",
        "user": user
    }

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security_bearer),
    db: Session = Depends(get_db)
) -> User:
    if not credentials:
        # Check if demo user exists or create default demo user for frictionless local evaluation
        demo_user = db.query(User).filter(User.email == "demo@digitaldarkspot.io").first()
        if not demo_user:
            demo_user = User(
                email="demo@digitaldarkspot.io",
                is_demo=True,
                last_login=datetime.datetime.utcnow()
            )
            db.add(demo_user)
            db.commit()
            db.refresh(demo_user)
        return demo_user
        
    token_str = credentials.credentials
    token_record = db.query(AuthToken).filter(
        AuthToken.token == token_str,
        AuthToken.expires_at > datetime.datetime.utcnow()
    ).first()
    
    if not token_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid credentials. Please log in again."
        )
        
    return token_record.user
