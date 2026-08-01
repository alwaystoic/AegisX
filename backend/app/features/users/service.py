from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.user import User
from app.features.users.schemas import UserCreate, UserLogin

from app.auth.security import (
    hash_password,
    verify_password,
)

from app.auth.auth import create_access_token


def create_user(db: Session, user: UserCreate):

    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hash_password(user.password),
        full_name=user.full_name,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

def login_user(db: Session, user: UserLogin):

    db_user = db.execute(
        select(User).where(User.username == user.username)
    ).scalar_one_or_none()

    if not db_user:
        return None

    if not verify_password(user.password, db_user.hashed_password):
        return None

    token = create_access_token({"sub": db_user.username})

    return {
        "access_token": token,
        "token_type": "bearer"
    }