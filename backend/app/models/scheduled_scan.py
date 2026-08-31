from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Integer, String

from app.db.base import Base


class ScheduledScan(Base):
    __tablename__ = "scheduled_scans"

    id = Column(Integer, primary_key=True, index=True)

    name = Column(String, nullable=False)

    database_name = Column(String, nullable=False)

    query = Column(String, nullable=False)

    interval_minutes = Column(Integer, nullable=False)

    enabled = Column(Boolean, nullable=False, default=True)

    created_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
    )

    updated_at = Column(
        DateTime,
        nullable=False,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
    )