from pydantic import BaseModel
from datetime import datetime

class ProgressResponse(BaseModel):
    id: int
    user_id: int
    quiz_id: int
    total_questions: int
    correct_answers: int
    wrong_answers: int
    score: float
    completed_at: datetime
    
    class Config:
        from_attributes = True

class QuizSubmission(BaseModel):
    quiz_id: int
    answers: dict  # {question_id: "a", question_id: "b", ...}
