from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class NoteBase(BaseModel):
    title: str
    description: str
    color: str = "#fff7b1"


class NoteCreate(NoteBase):
    pass


class NoteUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    color: Optional[str] = None
    is_starred: Optional[bool] = None


class Note(NoteBase):
    id: int
    user_id: int
    is_starred: bool
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
