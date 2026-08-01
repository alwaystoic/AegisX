from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.features.users.schemas import (
    UserCreate,
    UserResponse,
    UserLogin,
    Token,
)

from app.features.users.service import (
    create_user,
    login_user,
)

router = APIRouter(
    prefix="/users",
    tags=["Users"]
)


@router.post("/", response_model=UserResponse)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    return create_user(db, user)

@router.post("/login", response_model=Token)
def login(user: UserLogin, db: Session = Depends(get_db)):

    token = login_user(db, user)

    if token is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid username or password"
        )

    return token