from datetime import UTC, datetime

from sqlalchemy import func
from sqlmodel import Session, select

from app.core.base_repository import BaseRepository

from .model import DetallePedido, Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    # Filtrar pedidos por usuario, estado y paginación
    def list_by_usuario(
        self,
        usuario_id: int | None,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> tuple[int, list[Pedido]]:
        filtros = []

        if usuario_id is not None:
            filtros.append(Pedido.usuario_id == usuario_id)

        if estado:
            filtros.append(Pedido.estado == estado)

        total = self.session.exec(
            select(func.count()).select_from(Pedido).where(*filtros)
        ).one()

        pedidos = list(
            self.session.exec(
                select(Pedido)
                .where(*filtros)
                .order_by(Pedido.id.desc())
                .offset(skip)
                .limit(limit)
            ).all()
        )
        return total, pedidos

    # Calcular indicadores por estado
    def count_by_estado(self, estado: str) -> int:
        statement = (
            select(func.count()).select_from(Pedido).where(Pedido.estado == estado)
        )
        return self.session.exec(statement).one()

    # Contar pedidos creados hoy
    def count_hoy(self) -> int:
        hoy = datetime.now(UTC).date()

        statement = (
            select(func.count())
            .select_from(Pedido)
            .where(func.date(Pedido.created_at) == hoy)
        )
        return self.session.exec(statement).one()

    # umar el total de pedidos entregados
    def ingresos_entregados(self) -> float:
        statement = select(func.coalesce(func.sum(Pedido.total), 0.0)).where(
            Pedido.estado == "ENTREGADO"
        )

        return float(self.session.exec(statement).one())


class DetallePedidoRepository(BaseRepository[DetallePedido]):
    def __init__(self, session: Session):
        super().__init__(session, DetallePedido)
