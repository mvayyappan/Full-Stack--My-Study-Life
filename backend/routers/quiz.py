from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.quiz import Quiz
from models.question import Question
from models.progress import Progress
from models.user import User
from models.user_answer import UserAnswer
from schemas.quiz import QuizCreate, QuizResponse, QuestionCreate, QuizWithQuestions
from schemas.progress import QuizSubmission
from utils.security import get_current_user_dependency

router = APIRouter(
    prefix="/api/quiz",
    tags=["Quiz"]
)

@router.post("/create", response_model=QuizResponse)
def create_quiz(quiz: QuizCreate, db: Session = Depends(get_db)):
    """Create new quiz (Admin only)"""
    db_quiz = Quiz(**quiz.dict())
    db.add(db_quiz)
    db.commit()
    db.refresh(db_quiz)
    return db_quiz

@router.get("/all", response_model=list[QuizResponse])
def get_all_quizzes(db: Session = Depends(get_db)):
    """Get all available quizzes with actual question counts"""
    from sqlalchemy import func
    quizzes = db.query(Quiz).all()
    for quiz in quizzes:
        # Get actual count from questions table
        count = db.query(func.count(Question.id)).filter(Question.quiz_id == quiz.id).scalar()
        quiz.total_questions = count
    return quizzes


@router.get("/{quiz_id}", response_model=QuizWithQuestions)
def get_quiz_with_questions(quiz_id: int, db: Session = Depends(get_db)):
    """Get specific quiz with all questions"""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Quiz not found"
        )
    
    questions = db.query(Question).filter(Question.quiz_id == quiz_id).all()
    
    return {
        "id": quiz.id,
        "title": quiz.title,
        "subject": quiz.subject,
        "grade": quiz.grade,
        "total_questions": quiz.total_questions,
        "description": quiz.description,
        "created_at": quiz.created_at,
        "questions": questions
    }

@router.post("/add-question")
def add_question(question: QuestionCreate, db: Session = Depends(get_db)):
    """Add question to a quiz"""
    db_question = Question(**question.dict())
    db.add(db_question)
    db.commit()
    db.refresh(db_question)
    return db_question

@router.post("/submit/{quiz_id}")
def submit_quiz(
    quiz_id: int,
    submission: QuizSubmission,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Submit quiz answers and calculate score"""
    user_id = current_user.id
    
    # Get all questions for this quiz
    questions = db.query(Question).filter(Question.quiz_id == quiz_id).all()
    
    correct_count = 0
    wrong_count = 0
    
    # Process each answer
    for question in questions:
        user_answer_key = str(question.id)
        if user_answer_key in submission.answers:
            user_answer = submission.answers[user_answer_key]
            is_correct = user_answer.lower() == question.correct_answer.lower()
            
            # Save user answer
            db_user_answer = UserAnswer(
                user_id=user_id,
                quiz_id=quiz_id,
                question_id=question.id,
                user_answer=user_answer,
                is_correct=is_correct
            )
            db.add(db_user_answer)
            
            if is_correct:
                correct_count += 1
            else:
                wrong_count += 1
    
    # Calculate score percentage
    total = correct_count + wrong_count
    score_percentage = (correct_count / total * 100) if total > 0 else 0
    
    # Save progress
    progress = Progress(
        user_id=user_id,
        quiz_id=quiz_id,
        total_questions=total,
        correct_answers=correct_count,
        wrong_answers=wrong_count,
        score=score_percentage
    )
    
    db.add(progress)
    db.commit()
    db.refresh(progress)
    
    return {
        "score": score_percentage,
        "correct": correct_count,
        "wrong": wrong_count,
        "total": total,
        "message": f"Quiz submitted! Score: {score_percentage:.2f}%"
    }

@router.delete("/{quiz_id}")
def delete_quiz(quiz_id: int, db: Session = Depends(get_db)):
    """Delete a quiz and its questions"""
    quiz = db.query(Quiz).filter(Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # Delete associated questions first
    db.query(Question).filter(Question.quiz_id == quiz_id).delete()
    
    db.delete(quiz)
    db.commit()
    return {"message": "Quiz deleted successfully"}
