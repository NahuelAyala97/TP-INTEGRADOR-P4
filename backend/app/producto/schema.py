from pydantic import field_validator
from sqlmodel import Field, SQLModel

from app.categoria.schema import CategoriaRead


class ProductoBase(SQLModel):
    nombre: str = Field(min_length=1, max_length=100)
    descripcion: str | None = None
    precio_base: float = Field(ge=0)
    imagen_url: str | None = None
    stock: int = Field(default=0, ge=0)
    disponible: bool = True
    categoria_id: int

    @field_validator("nombre")
    @classmethod
    def validar_nombre(cls, value: str) -> str:
        value = value.strip()

        if not value:
            raise ValueError("El nombre no puede estar vacio.")

        return value


class ProductoCreate(ProductoBase):
    pass


class ProductoUpdate(SQLModel):
    nombre: str | None = Field(default=None, min_length=1, max_length=100)
    descripcion: str | None = None
    precio_base: float | None = Field(default=None, ge=0)
    imagen_url: str | None = None
    stock: int | None = Field(default=None, ge=0)
    disponible: bool | None = None
    categoria_id: int | None = None


class ProductoRead(ProductoBase):
    id: int
    activo: bool
    categoria: CategoriaRead


class ProductoStockUpdate(SQLModel):
    stock: int = Field(ge=0)
    disponible: bool


class ProductosPaginados(SQLModel):
    total: int
    items: list[ProductoRead]
