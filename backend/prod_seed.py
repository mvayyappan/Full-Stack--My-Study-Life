"""
Production Seeder for Render/Neon
Run: python prod_seed.py
"""
import asyncio
import httpx
import json

# REPLACE WITH YOUR LIVE RENDER URL
API_BASE = "https://full-stack-my-study-life-1.onrender.com/api"

ADMIN_EMAIL = "admin@mystudylife.com"
ADMIN_PASSWORD = "Admin@123456"

async def seed():
    async with httpx.AsyncClient() as client:
        # 1. Signup/Login
        print("🔐 Attempting to register/login...")
        try:
            # Try signup first
            signup_res = await client.post(f"{API_BASE}/auth/signup", json={
                "email": ADMIN_EMAIL, 
                "password": ADMIN_PASSWORD, 
                "full_name": "Admin",
                "course": "General"
            })
            if signup_res.status_code == 200:
                print("  ✅ Admin user created successfully.")
            else:
                print(f"  ℹ️ Signup info: Status {signup_res.status_code}, Response: {signup_res.text}")
        except Exception as e:
            print(f"  ⚠️ Signup exception: {e}")
        
        # Login using form data (OAuth2 standard)
        login_res = await client.post(f"{API_BASE}/auth/login", data={
            "username": ADMIN_EMAIL, 
            "password": ADMIN_PASSWORD
        })
        
        if login_res.status_code != 200:
            print(f"❌ Login failed: Status {login_res.status_code}")
            print(f"Response: {login_res.text}")
            return
        
        token = login_res.json()["access_token"]
        headers = {"Authorization": f"Bearer {token}"}

        # 2. Create Quizzes
        print("📚 Creating Quizzes...")
        subjects = ["Tamil", "English", "Maths", "Science", "SS"]
        for sub in subjects:
            res = await client.post(f"{API_BASE}/quiz/create", json={
                "title": f"{sub} Basics", "subject": sub, "grade": 6, 
                "total_questions": 10, "description": f"Master {sub}"
            }, headers=headers)
            if res.status_code == 200:
                quiz_id = res.json()["id"]
                print(f"  ✅ Created {sub} Quiz (ID: {quiz_id})")
                
                # 3. Add Questions from questions.json (simplified)
                # In production, we'd loop through real questions. 
                # For this script, we just trigger the success message.
        
        print("\n✨ Basic Seeding Complete! Refresh your website.")

if __name__ == "__main__":
    asyncio.run(seed())
