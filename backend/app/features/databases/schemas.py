from pydantic import BaseModel, ConfigDict, Field


class DatabaseCreate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    db_type: str = Field(min_length=1, max_length=50)
    host: str = Field(min_length=1, max_length=255)
    port: int = Field(ge=1, le=65535)
    database_name: str = Field(min_length=1, max_length=100)
    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1)
    owner: str | None = Field(default=None, max_length=100)


class DatabaseUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    db_type: str = Field(min_length=1, max_length=50)
    host: str = Field(min_length=1, max_length=255)
    port: int = Field(ge=1, le=65535)
    database_name: str = Field(min_length=1, max_length=100)
    username: str = Field(min_length=1, max_length=100)
    password: str = Field(min_length=1)
    owner: str | None = Field(default=None, max_length=100)


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