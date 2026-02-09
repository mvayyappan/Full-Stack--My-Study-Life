# My Study Life - Backend Setup Guide

## Project Structure
```
backend/
├── main.py              # Main FastAPI application
├── config.py            # Configuration settings
├── database.py          # Database connection
├── requirements.txt     # Python dependencies
├── .env                 # Environment variables
├── models/              # SQLAlchemy models
│   ├── user.py
│   ├── quiz.py
│   ├── question.py
│   ├── user_answer.py
│   └── progress.py
├── schemas/             # Pydantic validation schemas
│   ├── user.py
│   ├── quiz.py
│   └── progress.py
├── routers/             # API endpoints
│   ├── auth.py          # Authentication endpoints
│   ├── quiz.py          # Quiz endpoints
│   └── progress.py      # Progress tracking endpoints
└── utils/
    └── security.py      # Password hashing & JWT tokens
```

## Installation Steps

### 1. Install PostgreSQL
- Download from: https://www.postgresql.org/download/
- Install and remember your password
- Create database: `createdb my_study_life`

### 2. Update .env File
Edit `backend/.env` with your PostgreSQL password:
```
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@localhost:5432/my_study_life
```

### 3. Install Python Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 4. Run the Backend Server
```bash
python main.py
```

Server runs at: `http://127.0.0.1:8000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user

### Quiz
- `GET /api/quiz/all` - Get all quizzes
- `GET /api/quiz/{quiz_id}` - Get quiz with questions
- `POST /api/quiz/create` - Create new quiz
- `POST /api/quiz/add-question` - Add question to quiz
- `POST /api/quiz/submit/{quiz_id}` - Submit quiz answers

### Progress
- `GET /api/progress/user` - Get all user results
- `GET /api/progress/quiz/{quiz_id}` - Get specific quiz result
- `GET /api/progress/stats` - Get user statistics

## Interactive API Documentation
Visit: `http://127.0.0.1:8000/docs`

Here you can test all endpoints with Swagger UI!

## Example Usage

### 1. Signup
```bash
curl -X POST "http://127.0.0.1:8000/api/auth/signup" \
  -H "Content-Type: application/json" \
  -d '{"email": "student@example.com", "password": "123456", "full_name": "John Doe"}'
```

### 2. Login
```bash
curl -X POST "http://127.0.0.1:8000/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email": "student@example.com", "password": "123456"}'
```

Response: `{"access_token": "eyJhbGc...", "token_type": "bearer"}`

### 3. Get All Quizzes
```bash
curl -X GET "http://127.0.0.1:8000/api/quiz/all"
```

## Next Steps

1. **Add Quiz Data**: Create quizzes for all grades and subjects
2. **Add Questions**: Add 300+ questions across all quizzes
3. **Connect Frontend**: Update HTML forms to call these APIs
4. **Deploy**: Host on Heroku, AWS, or your preferred platform

## Troubleshooting

### "Database connection failed"
- Make sure PostgreSQL is running
- Check DATABASE_URL in .env

### "Module not found"
- Run: `pip install -r requirements.txt`

### "Port 8000 already in use"
- Change port in main.py: `uvicorn.run(..., port=8001)`

---
Created with ❤️ for My Study Life!
