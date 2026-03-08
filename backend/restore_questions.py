"""
High-Speed Restore 750 Questions to Production
Run: python backend/restore_questions.py
"""
import asyncio
import httpx
import json

API_BASE = "https://full-stack-my-study-life-1.onrender.com/api"
CONCURRENCY_LIMIT = 20  # Number of simultaneous requests

async def add_question(client, semaphore, quiz_id, q_data):
    async with semaphore:
        payload = {
            "quiz_id": quiz_id,
            "question_text": q_data['text'],
            "option_a": q_data['a'],
            "option_b": q_data['b'],
            "option_c": q_data['c'],
            "option_d": q_data['d'],
            "correct_answer": q_data['ans']
        }
        try:
            r = await client.post(f"{API_BASE}/quiz/add-question", json=payload, timeout=20.0)
            return r.status_code == 200
        except Exception as e:
            print(f"  ❌ Error for Quiz {quiz_id}: {e}")
            return False

async def restore():
    # 1. Load questions from JSON
    with open('backend/questions.json', 'r', encoding='utf-8') as f:
        questions_data = json.load(f)

    async with httpx.AsyncClient(timeout=30.0) as client:
        # 2. Get all quizzes
        print("🔍 Fetching all quizzes...")
        res = await client.get(f"{API_BASE}/quiz/all")
        if res.status_code != 200:
            print("❌ Failed to fetch quizzes")
            return
        
        quizzes = res.json()
        print(f"✅ Found {len(quizzes)} quizzes.")

        # 3. Add questions to each quiz
        semaphore = asyncio.Semaphore(CONCURRENCY_LIMIT)
        tasks = []
        for quiz in quizzes:
            subject = quiz['subject'].lower()
            if subject in questions_data:
                q_list = questions_data[subject]
                # Add up to 10 questions
                for i in range(10):
                    q_data = q_list[i % len(q_list)]
                    tasks.append(add_question(client, semaphore, quiz['id'], q_data))
        
        print(f"🚀 Restoring {len(tasks)} questions concurrently...")
        results = await asyncio.gather(*tasks)
        
        success_count = sum(1 for r in results if r)
        print(f"\n✨ Successfully restored {success_count} / {len(tasks)} questions to production!")

if __name__ == "__main__":
    asyncio.run(restore())
