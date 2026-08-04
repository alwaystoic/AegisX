from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
)
from sqlalchemy.sql import func

from app.db.base import Base


class Database(Base):
    __tablename__ = "databases"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String(100), nullable=False)

    db_type = Column(String(50), nullable=False)

    host = Column(String(255), nullable=False)

    port = Column(Integer, nullable=False)

    database_name = Column(String(100), nullable=False)

    username = Column(String(100), nullable=False)

    password = Column(String(255), nullable=False)

    owner = Column(String(100), nullable=True)

    is_active = Column(Boolean, default=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )