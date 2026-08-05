from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
)

from app.db.base import Base


class Threat(Base):
    __tablename__ = "threats"

    id = Column(Integer, primary_key=True, index=True)

    threat_name = Column(String(100), nullable=False)

    threat_type = Column(String(100), nullable=False)

    severity = Column(String(50), default="Low")

    source = Column(String(100), nullable=False)

    description = Column(String(500), nullable=True)

    mitigation = Column(String(500), nullable=True)

    status = Column(String(50), default="Active")

    is_active = Column(Boolean, default=True)