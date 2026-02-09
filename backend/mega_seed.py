"""
Fast Quiz Seeder (quizzes only)

Creates quizzes for grades 6-10 and subjects Tamil, English, Maths, Science, SS
Each combination will have Easy, Medium and Hard quizzes. This script creates
the quizzes only — questions can be added later.

Runs concurrently using httpx.AsyncClient for speed.
"""
import asyncio
import httpx
from itertools import product

API_BASE = "http://127.0.0.1:8000/api"

GRADES = [6, 7, 8, 9, 10]
SUBJECTS = ["Tamil", "English", "Maths", "Science", "SS"]
DIFFICULTIES = ["Easy", "Medium", "Hard"]

ADMIN_EMAIL = "admin@mystudylife.com"
ADMIN_PASSWORD = "Admin@123456"

CONCURRENCY = 16


async def get_token(client: httpx.AsyncClient) -> str | None:
    # Try signup (ignore failures if user exists)
    try:
        await client.post(f"{API_BASE}/auth/signup", json={
            "email": ADMIN_EMAIL,
            "password": ADMIN_PASSWORD,
            "full_name": "Admin Seeder"
        }, timeout=10.0)
    except Exception:
        pass

    # Login
    r = await client.post(f"{API_BASE}/auth/login", params={
        "email": ADMIN_EMAIL,
        "password": ADMIN_PASSWORD
    }, timeout=10.0)

    if r.status_code != 200:
        print("❌ Login failed:", r.status_code, r.text)
        return None
    return r.json().get("access_token")


async def create_quiz(client: httpx.AsyncClient, token: str, title: str, subject: str, grade: int):
    headers = {"Authorization": f"Bearer {token}"}
    payload = {
        "title": title,
        "subject": subject,
        "grade": grade,
        "total_questions": 0,
        "description": title
    }
    try:
        r = await client.post(f"{API_BASE}/quiz/create", json=payload, headers=headers, timeout=15.0)
        return r
    except Exception as e:
        return e


async def worker(semaphore: asyncio.Semaphore, client: httpx.AsyncClient, token: str, combo: tuple, results: list):
    grade, subject, diff = combo
    title = f"{subject} - Grade {grade} - {diff}"
    async with semaphore:
        res = await create_quiz(client, token, title, subject, grade)
        results.append((title, res))


async def main():
    combos = list(product(GRADES, SUBJECTS, DIFFICULTIES))
    print(f"🚀 Will create {len(combos)} quizzes")

    async with httpx.AsyncClient() as client:
        token = await get_token(client)
        if not token:
            print("Cannot obtain admin token — aborting")
            return

        sem = asyncio.Semaphore(CONCURRENCY)
        tasks = []
        results = []
        for combo in combos:
            tasks.append(asyncio.create_task(worker(sem, client, token, combo, results)))

        await asyncio.gather(*tasks)

    # Summarize
    success = [r for r in results if isinstance(r[1], httpx.Response) and r[1].status_code == 200]
    failures = [r for r in results if not (isinstance(r[1], httpx.Response) and r[1].status_code == 200)]

    print(f"\n✨ Seeding complete: {len(success)} succeeded, {len(failures)} failed")
    if failures:
        print("Sample failures:")
        for title, res in failures[:10]:
            if isinstance(res, httpx.Response):
                print(f" - {title}: {res.status_code} {res.text[:200]}")
            else:
                print(f" - {title}: Exception: {res}")


if __name__ == '__main__':
    asyncio.run(main())
