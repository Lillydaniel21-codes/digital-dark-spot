import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.database.session import engine, Base
from app.api import (
    auth_routes,
    dashboard_routes,
    research_routes,
    sources_routes,
    analysis_routes,
    chat_routes,
    report_routes,
    search_routes
)

# Initialize database schema
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_SUBTITLE,
    version="1.0.0"
)

# Configure CORS for local development and production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(auth_routes.router, prefix="/api")
app.include_router(dashboard_routes.router, prefix="/api")
app.include_router(search_routes.router, prefix="/api")
app.include_router(research_routes.router, prefix="/api")
app.include_router(sources_routes.router, prefix="/api")
app.include_router(analysis_routes.router, prefix="/api")
app.include_router(chat_routes.router, prefix="/api")
app.include_router(report_routes.router, prefix="/api")

# Serve uploaded documents statically if needed
if settings.UPLOAD_DIR.exists():
    app.mount("/uploads", StaticFiles(directory=str(settings.UPLOAD_DIR)), name="uploads")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "project": settings.PROJECT_NAME,
        "subtitle": settings.PROJECT_SUBTITLE,
        "ai_provider_configured": bool(settings.GEMINI_API_KEY or settings.OPENAI_API_KEY),
        "smtp_configured": bool(settings.SMTP_HOST),
        "demo_mode": not bool(settings.GEMINI_API_KEY and settings.SMTP_HOST)
    }

@app.get("/")
def root():
    return {
        "message": f"Welcome to {settings.PROJECT_NAME} API - {settings.PROJECT_SUBTITLE}",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
