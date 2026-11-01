from sqlalchemy import create_engine, text
from sqlalchemy.orm import declarative_base, sessionmaker
from app.core.config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    connect_args = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

def ensure_sqlite_schema():
    if not settings.DATABASE_URL.startswith("sqlite"):
        return
    with engine.connect() as conn:
        try:
            res = conn.execute(text("PRAGMA table_info(research_projects)")).fetchall()
            col_names = [r[1] for r in res]
            if col_names and "location" not in col_names:
                conn.execute(text("ALTER TABLE research_projects ADD COLUMN location VARCHAR(255)"))
                conn.commit()
        except Exception:
            pass

        try:
            res = conn.execute(text("PRAGMA table_info(chat_messages)")).fetchall()
            col_names = [r[1] for r in res]
            if col_names and "created_at" not in col_names:
                conn.execute(text("ALTER TABLE chat_messages ADD COLUMN created_at DATETIME"))
                conn.commit()
        except Exception:
            pass

ensure_sqlite_schema()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
