from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta
from database import get_db
from models.user import User
from schemas.user import UserCreate, UserResponse, Token
from utils.security import hash_password, verify_password, create_access_token, get_current_user_dependency
from config import settings
from typing import Optional
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth",tags=["Authentication"])

# Request schemas
class UpdateProfileRequest(BaseModel):
    full_name: str
    course: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class MessageResponse(BaseModel):
    message: str


@router.post("/signup", response_model=UserResponse)
def signup(user: UserCreate, db: Session = Depends(get_db)):
    """User registration endpoint"""
    # Check if user exists
    db_user = db.query(User).filter(User.email == user.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create new user with hashed password
    hashed_password = hash_password(user.password)
    db_user = User(
        email=user.email,
        hashed_password=hashed_password,
        full_name=user.full_name,
        course=getattr(user, 'course', None)
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    """User login endpoint"""
    email = form_data.username
    password = form_data.password
    
    # Find user
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Verify password
    if not verify_password(password, str(user.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )
    
    # Create JWT token
    access_token = create_access_token(
        data={"sub": user.email}
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer"
    }

@router.get("/me", response_model=UserResponse)
def get_current_user(
    current_user: User = Depends(get_current_user_dependency)
):
    """Get current logged-in user"""
    return current_user

@router.put("/update-profile", response_model=UserResponse)
def update_profile(
    request: UpdateProfileRequest,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Update user profile (name and course)"""
    if request.full_name:
        current_user.full_name = request.full_name
    if request.course:
        current_user.course = request.course

    db.commit()
    db.refresh(current_user)
    return current_user

@router.post("/change-password", response_model=MessageResponse)
def change_password(
    request: ChangePasswordRequest,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Change user password"""
    if not verify_password(request.current_password, str(current_user.hashed_password)):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Current password is incorrect"
        )

    current_user.hashed_password = hash_password(request.new_password)
    db.commit()

    return {"message": "Password changed successfully"}

@router.delete("/delete-account", response_model=MessageResponse)
def delete_account(
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Delete user account and all associated data"""
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted successfully"}
