from datetime import UTC, datetime
from typing import TYPE_CHECKING

from sqlmodel import Field, Relationship, SQLModel

if TYPE_CHECKING:
    from app.pedido.model import Pedido


def fecha_actual():
    return datetime.now(UTC)


class Usuario(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    username: str = Field(unique=True)
    full_name: str
    email: str = Field(unique=True)
    hashed_password: str
    role: str = Field(default="user")
    disabled: bool = Field(default=False)
    created_at: datetime = Field(default_factory=fecha_actual)

    pedidos: list["Pedido"] = Relationship(back_populates="usuario")
