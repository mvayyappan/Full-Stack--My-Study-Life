import sys
import os

# Add the current directory to sys.path to allow imports to work on Vercel
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import Base, engine
from models import User, Quiz, Question, UserAnswer, Progress, Note
from routers import auth_router, quiz_router, progress_router, notes_router
from config import settings

# Create all database tables
Base.metadata.create_all(bind=engine)

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION
)

# Add CORS middleware (allows frontend to call backend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router)
app.include_router(quiz_router)
app.include_router(progress_router)
app.include_router(notes_router)

@app.get("/")
def read_root():
    """Welcome endpoint"""
    return {
        "message": "Welcome to My Study Life API",
        "version": settings.APP_VERSION,
        "docs": "/docs"  # Swagger UI
    }

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )
