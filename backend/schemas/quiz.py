from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class QuestionBase(BaseModel):
    question_text: str
    option_a: str
    option_b: str
    option_c: str
    option_d: str
    correct_answer: str

class QuestionCreate(QuestionBase):
    quiz_id: int

class QuestionResponse(QuestionBase):
    id: int
    quiz_id: int
    
    class Config:
        from_attributes = True

class QuizBase(BaseModel):
    title: str
    subject: str
    grade: int
    total_questions: int
    description: Optional[str] = None

class QuizCreate(QuizBase):
    pass

class QuizResponse(QuizBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class QuizWithQuestions(QuizResponse):
    questions: List[QuestionResponse] = []
