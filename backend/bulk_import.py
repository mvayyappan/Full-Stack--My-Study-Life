"""
Bulk import questions from questions.json to replace placeholders.
Run: venv\Scripts\python.exe bulk_import.py
"""
import json
from database import SessionLocal
from models.quiz import Quiz
from models.question import Question

def bulk_import():
    with open('questions.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    db = SessionLocal()
    total_added = 0
    
    try:
        for subject, questions in data.items():
            # Get all quizzes for this subject
            quizzes = db.query(Quiz).filter(Quiz.subject == subject.title()).all()
            print(f"\n📚 {subject.upper()}: Found {len(quizzes)} quizzes")
            
            for quiz in quizzes:
                # Delete existing placeholder questions
                deleted = db.query(Question).filter(Question.quiz_id == quiz.id).delete()
                
                # Add real questions (up to 10)
                for i in range(min(10, len(questions))):
                    q_data = questions[i % len(questions)]
                    new_q = Question(
                        quiz_id=quiz.id,
                        question_text=q_data['text'],
                        option_a=q_data['a'],
                        option_b=q_data['b'],
                        option_c=q_data['c'],
                        option_d=q_data['d'],
                        correct_answer=q_data['ans']
                    )
                    db.add(new_q)
                    total_added += 1
                
                db.commit()
                print(f"  ✓ {quiz.title}: Replaced {deleted} with 10 real questions")
        
        print(f"\n✅ Successfully imported {total_added} real questions!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == '__main__':
    bulk_import()
