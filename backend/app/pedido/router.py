from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.deps import get_current_active_user, require_role
from app.modules.usuarios.schema import UserPublic

from .schema import (
    CambioEstado,
    PedidoCreate,
    PedidoRead,
    PedidosPaginados,
    ResumenPedidos,
)
from .service import (
    PedidoAjeno,
    PedidoNoEncontrado,
    PedidoService,
    ProductoNoDisponible,
    ProductoNoEncontrado,
    ProductoRepetido,
    StockInsuficiente,
    TransicionInvalida,
)

router = APIRouter(prefix="/pedidos", tags=["Pedidos"])


# Crea un pedido asociado al usuario autenticado
@router.post("", response_model=PedidoRead, status_code=201)
def crear_pedido(
    datos: PedidoCreate,
    usuario: Annotated[UserPublic, Depends(get_current_active_user)],
    service: PedidoService = Depends(PedidoService),
):
    try:
        return service.crear_pedido(datos, usuario.id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except (
        ProductoNoDisponible,
        ProductoRepetido,
        StockInsuficiente,
    ) as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


# Lista los pedidos segun el usuario y su rol
@router.get("", response_model=PedidosPaginados)
def listar_pedidos(
    usuario: Annotated[UserPublic, Depends(get_current_active_user)],
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    estado: str | None = None,
    service: PedidoService = Depends(PedidoService),
):
    return service.listar_pedidos(usuario.id, usuario.role, skip, limit, estado)


# Obtiene los indicadores del panel de administracion
@router.get(
    "/resumen",
    response_model=ResumenPedidos,
    dependencies=[Depends(require_role(["admin"]))],
)
def obtener_resumen(
    service: PedidoService = Depends(PedidoService),
):
    return service.obtener_resumen()


# Obtiene un pedido y verifica que pertenezca al usuario
@router.get("/{pedido_id}", response_model=PedidoRead)
def obtener_pedido(
    pedido_id: int,
    usuario: Annotated[UserPublic, Depends(get_current_active_user)],
    service: PedidoService = Depends(PedidoService),
):
    try:
        return service.obtener_pedido(pedido_id, usuario.id, usuario.role)
    except PedidoNoEncontrado as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PedidoAjeno as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc


# Permite al administrador avanzar o cancelar un pedido
@router.patch(
    "/{pedido_id}/estado",
    response_model=PedidoRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def cambiar_estado(
    pedido_id: int,
    datos: CambioEstado,
    service: PedidoService = Depends(PedidoService),
):
    try:
        return service.cambiar_estado(pedido_id, datos.estado)
    except (PedidoNoEncontrado, ProductoNoEncontrado) as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except TransicionInvalida as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc


# Permite al cliente cancelar solamente sus pedidos pendientes
@router.patch("/{pedido_id}/cancelar", response_model=PedidoRead)
def cancelar_pedido(
    pedido_id: int,
    usuario: Annotated[UserPublic, Depends(get_current_active_user)],
    service: PedidoService = Depends(PedidoService),
):
    try:
        return service.cambiar_estado(pedido_id, "CANCELADO", usuario.id)
    except (PedidoNoEncontrado, ProductoNoEncontrado) as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except PedidoAjeno as exc:
        raise HTTPException(status_code=403, detail=str(exc)) from exc
    except TransicionInvalida as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
