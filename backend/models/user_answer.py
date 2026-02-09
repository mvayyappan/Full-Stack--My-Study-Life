from sqlalchemy import Column, Integer, ForeignKey, String, Float, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base

class UserAnswer(Base):
    __tablename__ = "user_answers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    quiz_id = Column(Integer, ForeignKey("quizzes.id"))
    question_id = Column(Integer, ForeignKey("questions.id"))
    user_answer = Column(String)  # a, b, c, or d
    is_correct = Column(Boolean)
    
    # Relationships
    user = relationship("User", back_populates="user_answers")
