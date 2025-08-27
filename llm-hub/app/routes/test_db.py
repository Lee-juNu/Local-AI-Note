import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db_session import SessionLocal
from app.models_test import User

router = APIRouter(prefix="/test/db", tags=["test-db"])

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.post("/user")
def create_user(email: str, db: Session = Depends(get_db)):
    user_id = str(uuid.uuid4())
    user = User(id=user_id, email=email, name="tester")
    db.add(user)
    try:
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"insert failed: {e}")
    return {"id": user_id, "email": email}

@router.get("/users")
def list_users(db: Session = Depends(get_db)):
    rows = db.query(User).all()
    return [{"id": u.id, "email": u.email, "name": u.name} for u in rows]
