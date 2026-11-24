from pydantic import field_validator
from sqlmodel import Field, SQLModel


class CategoriaBase(SQLModel):
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: str = Field(default="")

    @field_validator("nombre", "descripcion", mode="before")
    @classmethod
    def limpiar_texto(cls, value: str) -> str:
        return value.strip() if isinstance(value, str) else value


class CategoriaCreate(CategoriaBase):
    pass


class CategoriaUpdate(SQLModel):
    nombre: str | None = Field(default=None, min_length=2, max_length=100)
    descripcion: str | None = None

    @field_validator("nombre", "descripcion", mode="before")
    @classmethod
    def limpiar_texto(cls, value: str | None) -> str | None:
        return value.strip() if isinstance(value, str) else value


class CategoriaRead(CategoriaBase):
    id: int
    activo: bool
