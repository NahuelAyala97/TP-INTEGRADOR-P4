from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship

from .schema import CategoriaBase

if TYPE_CHECKING:
    from app.producto.model import Producto


class Categoria(CategoriaBase, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(unique=True, min_length=2, max_length=100)
    activo: bool = Field(default=True)

    productos: list["Producto"] = Relationship(back_populates="categoria")
