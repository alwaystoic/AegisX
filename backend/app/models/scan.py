from sqlalchemy import (
    Column,
    Integer,
    String,
    Boolean,
)

from app.db.base import Base


class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)

    scan_name = Column(String(100), nullable=False)

    database_name = Column(String(100), nullable=False)

    status = Column(String(50), default="Pending")

    severity = Column(String(50), default="Low")

    vulnerabilities_found = Column(Integer, default=0)

    recommendation = Column(String(500), nullable=True)

    is_active = Column(Boolean, default=True)