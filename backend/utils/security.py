from fastapi import Depends, Header, HTTPException, status
from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from sqlalchemy.orm import Session
from typing import Optional
from config import settings
from database import get_db

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    """Hash password using bcrypt"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password matches hash"""
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    """Create JWT token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

def decode_token(token: str) -> str | None:
    """Decode JWT token"""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str | None = payload.get("sub")
        if email is None:
            return None
        return email
    except JWTError:
        try:
            print(f"[security.decode_token] Failed to decode token: {token[:20]}...")
        except Exception:
            pass
        return None


def extract_token(authorization: Optional[str]) -> Optional[str]:
    """Extract token from Authorization header."""
    if not authorization:
        return None
    parts = authorization.split()
    return parts[-1] if parts else None


def get_user_by_token(authorization: Optional[str], db: Session):
    """Get a user from the database using a JWT token."""
    token = extract_token(authorization)
    if not token:
        return None
    email = decode_token(token)
    if not email:
        return None
    from models.user import User
    return db.query(User).filter(User.email == email).first()


def get_current_user(authorization: Optional[str], db: Session):
    """Get current user and raise 401 if the token is missing or invalid."""
    user = get_user_by_token(authorization, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing token"
        )
    return user


def get_current_user_dependency(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """FastAPI dependency that returns the authenticated user."""
    return get_current_user(authorization, db)
