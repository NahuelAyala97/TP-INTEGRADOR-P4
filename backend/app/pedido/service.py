from datetime import UTC, datetime

from .model import DetallePedido, Pedido
from .schema import PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos
from .unit_of_work import PedidoUnitOfWork


# Excepciones del modulo
class ProductoNoEncontrado(Exception):
    pass


class ProductoNoDisponible(Exception):
    pass


class StockInsuficiente(Exception):
    pass


class ProductoRepetido(Exception):
    pass


class PedidoNoEncontrado(Exception):
    pass


class PedidoAjeno(Exception):
    pass


class TransicionInvalida(Exception):
    pass


# Define los cambios de estado permitidos
TRANSICIONES = {
    "PENDIENTE": {"EN_PREPARACION", "CANCELADO"},
    "EN_PREPARACION": {"ENTREGADO", "CANCELADO"},
    "ENTREGADO": set(),
    "CANCELADO": set(),
}


class PedidoService:
    def __init__(self):
        self.uow = PedidoUnitOfWork()

    def crear_pedido(self, datos: PedidoCreate, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            ids = [item.producto_id for item in datos.items]

            if len(ids) != len(set(ids)):
                raise ProductoRepetido("No se puede repetir un producto")

            pedido = Pedido(
                usuario_id=usuario_id,
                forma_pago=datos.forma_pago,
                direccion_entrega=datos.direccion_entrega,
                notas=datos.notas,
            )

            uow.pedidos.add(pedido)

            total = 0.0

            for item in datos.items:
                producto = uow.productos.get_by_id(item.producto_id)

                if not producto:
                    raise ProductoNoEncontrado("Producto no encontrado")

                if not producto.disponible:
                    raise ProductoNoDisponible("Producto no disponible")

                if producto.stock < item.cantidad:
                    raise StockInsuficiente("Stock insuficiente")

                producto.stock -= item.cantidad
                uow.productos.add(producto)

                subtotal = producto.precio_base * item.cantidad

                detalle = DetallePedido(
                    pedido_id=pedido.id,
                    producto_id=producto.id,
                    cantidad=item.cantidad,
                    nombre_producto=producto.nombre,
                    precio_unitario=producto.precio_base,
                    subtotal=subtotal,
                )

                uow.detalles.add(detalle)
                total += subtotal

            pedido.total = total
            uow.pedidos.add(pedido)

            return PedidoRead.model_validate(pedido)

    # Lista los pedidos segun el rol del usuario
    def listar_pedidos(
        self,
        usuario_id: int,
        role: str,
        skip: int = 0,
        limit: int = 20,
        estado: str | None = None,
    ) -> PedidosPaginados:
        with self.uow as uow:
            # El administrador ve todos, el cliente solo los propios
            filtro_usuario = None if role == "admin" else usuario_id

            total, pedidos = uow.pedidos.list_by_usuario(
                filtro_usuario, skip, limit, estado
            )

            return PedidosPaginados(
                total=total,
                items=[PedidoRead.model_validate(p) for p in pedidos],
            )

    # Obtiene un pedido y verifica que el usuario tenga permiso
    def obtener_pedido(self, pedido_id: int, usuario_id: int, role: str) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)

            if not pedido:
                raise PedidoNoEncontrado("Pedido no encontrado")

            # Solo el administrador puede consultar pedidos ajenos
            if role != "admin" and pedido.usuario_id != usuario_id:
                raise PedidoAjeno("No tienes permiso para ver este pedido")

            return PedidoRead.model_validate(pedido)

    # Cambia el estado de un pedido segun las transiciones permitidas
    def cambiar_estado(
        self,
        pedido_id: int,
        nuevo_estado: str,
        usuario_id: int | None = None,
    ) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(pedido_id)

            if not pedido:
                raise PedidoNoEncontrado("Pedido no encontrado")

            # Si cancela un cliente, verifica que el pedido sea suyo y este pendiente
            if usuario_id is not None:
                if pedido.usuario_id != usuario_id:
                    raise PedidoAjeno("No tienes permiso para cancelar este pedido")

                if pedido.estado != "PENDIENTE":
                    raise TransicionInvalida("Solo puedes cancelar pedidos pendientes")

            # Verifica que el cambio de estado sea valido
            if nuevo_estado not in TRANSICIONES[pedido.estado]:
                raise TransicionInvalida("Transicion de estado invalida")

            # Si se cancela, devuelve el stock de todos los productos
            if nuevo_estado == "CANCELADO":
                for detalle in pedido.items:
                    producto = uow.productos.get_by_id_incluyendo_inactivos(
                        detalle.producto_id
                    )

                    if not producto:
                        raise ProductoNoEncontrado("Producto no encontrado")

                    producto.stock += detalle.cantidad
                    uow.productos.add(producto)

            # Actualiza el estado y la fecha de modificacion
            pedido.estado = nuevo_estado
            pedido.updated_at = datetime.now(UTC)

            uow.pedidos.add(pedido)

            return PedidoRead.model_validate(pedido)

    # Obtiene los indicadores para el panel de administracion
    def obtener_resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            return ResumenPedidos(
                pendientes=uow.pedidos.count_by_estado("PENDIENTE"),
                en_preparacion=uow.pedidos.count_by_estado("EN_PREPARACION"),
                entregados=uow.pedidos.count_by_estado("ENTREGADO"),
                cancelados=uow.pedidos.count_by_estado("CANCELADO"),
                pedidos_hoy=uow.pedidos.count_hoy(),
                ingresos_entregados=uow.pedidos.ingresos_entregados(),
            )
