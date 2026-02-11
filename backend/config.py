import os
from pydantic import field_validator
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    # Database (Vercel uses DATABASE_URL, local uses the default)
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql+psycopg2://postgres:AcademyRootPassword@localhost:5432/my_study_life")

    @field_validator("DATABASE_URL", mode="before")
    @classmethod
    def fix_database_url(cls, v: str) -> str:
        if not v or not isinstance(v, str):
            print("⚠️ DATABASE_URL is missing or empty!")
            return v
        
        # Clean the string (strip spaces/quotes often copied from dashboards)
        v = v.strip().replace('"', '').replace("'", "")
        
        # Masked logging for debugging
        try:
            parts = v.split("@")
            host_part = parts[-1] if len(parts) > 1 else "Unknown"
            print(f"Database Host Detected: {host_part}")
        except Exception:
            print("Connecting to database...")

        # Fix for Vercel/Heroku protocol mismatch
        if v.startswith("postgres://"):
            v = v.replace("postgres://", "postgresql://", 1)
        
        # Ensure we use psycopg2 driver
        if "postgresql://" in v and "+psycopg2" not in v:
            v = v.replace("postgresql://", "postgresql+psycopg2://", 1)
        
        return v
    
    # JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # App
    APP_NAME: str = "My Study Life API"
    APP_VERSION: str = "1.0.0"
    
    class Config:
        env_file = ".env"

settings = Settings()
