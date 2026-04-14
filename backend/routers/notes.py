from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.notes import Note
from models.user import User
from schemas.notes import NoteCreate, NoteUpdate, Note as NoteSchema
from utils.security import get_current_user_dependency

router = APIRouter(prefix="/api/notes", tags=["notes"])


@router.post("/", response_model=NoteSchema)
def create_note(
    note: NoteCreate,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Create a new note for the current user"""
    db_note = Note(
        title=note.title,
        description=note.description,
        color=note.color,
        user_id=current_user.id
    )
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note


@router.get("/", response_model=list[NoteSchema])
def get_user_notes(
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Get all notes for the current user"""
    notes = db.query(Note).filter(Note.user_id == current_user.id).all()
    return notes


@router.get("/{note_id}", response_model=NoteSchema)
def get_note(
    note_id: int,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Get a specific note"""
    note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    return note


@router.put("/{note_id}", response_model=NoteSchema)
def update_note(
    note_id: int,
    note_update: NoteUpdate,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Update a note"""
    db_note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
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
def delete_note(
    note_id: int,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Delete a note"""
    db_note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not db_note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    
    db.delete(db_note)
    db.commit()
    return {"message": "Note deleted successfully"}


@router.patch("/{note_id}/star")
def toggle_star(
    note_id: int,
    current_user: User = Depends(get_current_user_dependency),
    db: Session = Depends(get_db)
):
    """Toggle star status of a note"""
    db_note = db.query(Note).filter(Note.id == note_id, Note.user_id == current_user.id).first()
    if not db_note:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Note not found")
    
    db_note.is_starred = not db_note.is_starred
    db.add(db_note)
    db.commit()
    db.refresh(db_note)
    return db_note
