from fastapi import APIRouter, Depends, HTTPException, status, Header
from typing import Optional
from sqlalchemy.orm import Session
from database import get_db
from models.progress import Progress
from models.user import User
from schemas.progress import ProgressResponse
from utils.security import decode_token

router = APIRouter(
    prefix="/api/progress",
    tags=["Progress"]
)

def get_current_user_id(authorization: str, db: Session):
    """Get current user ID from Authorization header"""
    if not authorization:
        return None
    
    parts = authorization.split()
    token = parts[-1]
    
    email = decode_token(token)
    if not email:
        return None
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        return None
    return user.id

@router.get("/user", response_model=list[ProgressResponse])
def get_user_progress(
    authorization: Optional[str] = Header(None), 
    db: Session = Depends(get_db)
):
    """Get all quiz results for current user"""
    user_id = get_current_user_id(authorization, db)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    
    progress_list = db.query(Progress).filter(Progress.user_id == user_id).all()
    return progress_list

@router.get("/quiz/{quiz_id}")
def get_quiz_result(
    quiz_id: int, 
    authorization: Optional[str] = Header(None), 
    db: Session = Depends(get_db)
):
    """Get result for specific quiz taken by user"""
    user_id = get_current_user_id(authorization, db)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    
    progress = db.query(Progress).filter(
        Progress.user_id == user_id,
        Progress.quiz_id == quiz_id
    ).first()
    
    if not progress:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz result not found"
        )
    
    return progress

@router.get("/stats")
def get_user_stats(
    authorization: Optional[str] = Header(None), 
    db: Session = Depends(get_db)
):
    """Get user statistics"""
    user_id = get_current_user_id(authorization, db)
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid or missing token")
    
    progress_list = db.query(Progress).filter(Progress.user_id == user_id).all()
    
    if not progress_list:
        return {
            "total_quizzes": 0,
            "average_score": 0,
            "accuracy": 0,
            "current_streak": 0,
            "total_questions": 0,
            "correct_answers": 0,
            "study_hours": 0
        }
    
    total_correct = sum(p.correct_answers for p in progress_list)
    total_questions = sum(p.total_questions for p in progress_list)
    average_score = sum(p.score for p in progress_list) / len(progress_list)
    accuracy = (total_correct / total_questions * 100) if total_questions > 0 else 0
    
    # Calculate study hours based on quiz attempts (rough estimate: 1 hour per 50 questions)
    study_hours = max(1, total_questions // 50)
    
    # Calculate streak (simplified: count consecutive days with quizzes)
    current_streak = 0
    if progress_list:
        # Sort by date
        sorted_progress = sorted(progress_list, key=lambda p: p.completed_at, reverse=True)
        current_streak = len(sorted_progress)  # Simple approach
    
    return {
        "total_quizzes": len(progress_list),
        "average_score": round(average_score, 2),
        "accuracy": round(accuracy, 2),
        "current_streak": current_streak,
        "total_questions": total_questions,
        "correct_answers": total_correct,
        "study_hours": study_hours
    }
