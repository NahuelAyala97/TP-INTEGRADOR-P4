from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository

from .model import Categoria


class CategoriaRepository(BaseRepository[Categoria]):
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    def get_all(self) -> list[Categoria]:
        statement = select(Categoria).where(col(Categoria.activo).is_(True))
        return list(self.session.exec(statement).all())

    def get_by_id(self, categoria_id: int) -> Categoria | None:
        statement = select(Categoria).where(
            Categoria.id == categoria_id,
            col(Categoria.activo).is_(True),
        )
        return self.session.exec(statement).first()

    def obtener_por_nombre(self, nombre: str) -> Categoria | None:
        statement = select(Categoria).where(Categoria.nombre == nombre)
        return self.session.exec(statement).first()
