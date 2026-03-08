"""
Cleanup Test Data from Production
Run: python backend/cleanup_test_data.py
"""
import asyncio
import httpx

API_BASE = "https://full-stack-my-study-life-1.onrender.com/api"

async def cleanup():
    async with httpx.AsyncClient(timeout=30.0) as client:
        # IDs of the 5 "Basics" test quizzes
        test_quiz_ids = [1, 2, 3, 4, 5]
        
        print(f"🧹 Starting cleanup of {len(test_quiz_ids)} test quizzes...")
        
        for quiz_id in test_quiz_ids:
            print(f"  🗑️ Deleting Quiz ID: {quiz_id}...")
            try:
                # We added the DELETE /api/quiz/{id} endpoint
                r = await client.delete(f"{API_BASE}/quiz/{quiz_id}")
                if r.status_code == 200:
                    print(f"    ✅ Deleted successfully.")
                else:
                    print(f"    ❌ Failed: {r.status_code} {r.text}")
            except Exception as e:
                print(f"    ❌ Error: {e}")
        
        print("\n✨ Cleanup Complete! Refresh your website.")

if __name__ == "__main__":
    asyncio.run(cleanup())
