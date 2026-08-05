from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
)

from sqlalchemy.sql import func

from app.db.base import Base


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(Integer, primary_key=True, index=True)

    title = Column(String(200), nullable=False)

    description = Column(String(1000), nullable=False)

    severity = Column(String(50), nullable=False)

    status = Column(String(50), default="Open")

    is_active = Column(Boolean, default=True)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
    )