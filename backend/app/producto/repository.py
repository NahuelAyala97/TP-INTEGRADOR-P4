from sqlalchemy import func
from sqlmodel import Session, col, select

from app.core.base_repository import BaseRepository

from .model import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    # Busca un producto activo por su id
    def get_by_id(self, producto_id: int) -> Producto | None:
        statement = select(Producto).where(
            Producto.id == producto_id,
            col(Producto.activo).is_(True),
        )
        return self.session.exec(statement).first()

    # Busca productos con filtros
    def search(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> tuple[int, list[Producto]]:

        filtros = [col(Producto.activo).is_(True)]
        if search:
            filtros.append(col(Producto.nombre).ilike(f"%{search}%"))

        if categoria_id is not None:
            filtros.append(Producto.categoria_id == categoria_id)

        if disponible is not None:
            filtros.append(col(Producto.disponible).is_(disponible))

        total = self.session.exec(
            select(func.count()).select_from(Producto).where(*filtros)
        ).one()

        statement = (
            select(Producto)
            .where(*filtros)
            .order_by(Producto.id)
            .offset(skip)
            .limit(limit)
        )

        productos = list(self.session.exec(statement).all())

        return total, productos

    # Busca un producto incluyendo los que fueron dados de baja
    def get_by_id_incluyendo_inactivos(self, producto_id: int) -> Producto | None:
        return super().get_by_id(producto_id)
