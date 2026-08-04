from pydantic import BaseModel, ConfigDict


class DatabaseCreate(BaseModel):
    name: str
    db_type: str
    host: str
    port: int
    database_name: str
    username: str
    password: str
    owner: str | None = None


class DatabaseUpdate(BaseModel):
    name: str
    db_type: str
    host: str
    port: int
    database_name: str
    username: str
    password: str
    owner: str | None = None


class DatabaseResponse(BaseModel):
    id: int
    name: str
    db_type: str
    host: str
    port: int
    database_name: str
    username: str
    owner: str | None
    is_active: bool

    model_config = ConfigDict(from_attributes=True)