from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import all models here
from app.models.user import User
from app.models.database import Database
from app.models.incident import Incident
from app.models.scan import Scan
