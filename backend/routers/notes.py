from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from database import get_db
from models.notes import Note
from models.user import User
from schemas.notes import NoteCreate, NoteUpdate, Note as NoteSchema
from utils.security import decode_token
from typing import Optional

router = APIRouter(prefix="/api/notes", tags=["notes"])


def get_current_user_id(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Get current user ID from Authorization header"""
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header"
        )

    # Extract token: support both 'Bearer <token>' and raw token
    parts = authorization.split()
    if len(parts) == 0:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authorization header")
    token = parts[-1]

    email = decode_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token"
        )
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    return user.id


@router.post("/", response_model=NoteSchema)
def create_note(note: NoteCreate, authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Create a new note for the current user"""
    user_id = get_current_user_id(authorization, db)
    db_note = Note(
        title=note.title,
        description=note.description,
        color=note.color,
        user_id=user_id
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


@router.get("/", response_model=list[NoteSchema])
def get_user_notes(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Get all notes for the current user"""
    user_id = get_current_user_id(authorization, db)
    notes = db.query(Note).filter(Note.user_id == user_id).all()
    return notes


@router.get("/{note_id}", response_model=NoteSchema)
def get_note(note_id: int, authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Get a specific note"""
    user_id = get_current_user_id(authorization, db)
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == user_id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return note


@router.put("/{note_id}", response_model=NoteSchema)
def update_note(note_id: int, note_update: NoteUpdate, authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Update a note"""
    user_id = get_current_user_id(authorization, db)
    db_note = db.query(Note).filter(Note.id == note_id, Note.user_id == user_id).first()
    if not db_note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    
    update_data = note_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_note, key, value)
    
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


@router.delete("/{note_id}")
def delete_note(note_id: int, authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Delete a note"""
    user_id = get_current_user_id(authorization, db)
    db_note = db.query(Note).filter(Note.id == note_id, Note.user_id == user_id).first()
    if not db_note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    
    db.delete(db_note)
    db.commit()
    return {"message": "Note deleted successfully"}


@router.patch("/{note_id}/star")
def toggle_star(note_id: int, authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    """Toggle star status of a note"""
    user_id = get_current_user_id(authorization, db)
    db_note = db.query(Note).filter(Note.id == note_id, Note.user_id == user_id).first()
    if not db_note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    
    db_note.is_starred = not db_note.is_starred
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note
