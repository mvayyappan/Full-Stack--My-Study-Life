from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime
from database import Base

class Quiz(Base):
    __tablename__ = "quizzes"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)  # "Grade 6 Tamil Quiz"
    subject = Column(String, index=True)  # Tamil, English, Math, Science, SS
    grade = Column(Integer)  # 6, 7, 8, 9, 10
    description = Column(Text, nullable=True)
    total_questions = Column(Integer)  # Max 300
    created_at = Column(DateTime, default=datetime.utcnow)
