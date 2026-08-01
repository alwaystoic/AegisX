from sqlalchemy.orm import Session

from app.models.user import User
from app.features.users.schemas import UserCreate
from app.auth.security import hash_password


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