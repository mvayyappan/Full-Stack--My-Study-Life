from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from config import settings

# ✅ Fixed for Render PostgreSQL — handles SSL drops & stale connections
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,        # Auto-reconnect if SSL dropped
    pool_recycle=300,          # Recycle connections every 5 mins
    pool_size=5,               # Max 5 connections in pool
    max_overflow=2,            # Allow 2 extra connections
    echo=False,                # Set False in production
    connect_args={
        "keepalives": 1,
        "keepalives_idle": 30,
        "keepalives_interval": 10,
        "keepalives_count": 5,
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    """Dependency for getting database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
