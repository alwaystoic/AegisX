from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
    DateTime,
)

from datetime import datetime

from app.db.base import Base


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)

    username = Column(String(100), nullable=False)

    action = Column(String(100), nullable=False)

    resource = Column(String(100), nullable=False)

    details = Column(String(500), nullable=True)

    timestamp = Column(DateTime, default=datetime.utcnow)

    is_active = Column(Boolean, default=True)