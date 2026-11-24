from fastapi import APIRouter, Depends, HTTPException, Query

from app.core.deps import require_role

from .schema import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from .service import (
    CategoriaNoEncontrada,
    ProductoNoEncontrado,
    ProductoService,
)

router = APIRouter(prefix="/productos", tags=["Productos"])


# Listar todos los productos
@router.get("", response_model=ProductosPaginados)
def listar_productos(
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    search: str | None = None,
    categoria_id: int | None = None,
    disponible: bool | None = None,
    service: ProductoService = Depends(ProductoService),
):
    return service.listar_productos(skip, limit, search, categoria_id, disponible)


# Obtener un producto por su id
@router.get(
    "/{producto_id}",
    response_model=ProductoRead,
)
def obtener_producto(
    producto_id: int, service: ProductoService = Depends(ProductoService)
):
    try:
        return service.obtener_producto(producto_id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


# Crear un nuevo producto
@router.post(
    "",
    response_model=ProductoRead,
    status_code=201,
    dependencies=[Depends(require_role(["admin"]))],
)
def crear_producto(
    producto_request: ProductoCreate,
    service: ProductoService = Depends(ProductoService),
):
    try:
        return service.crear_producto(producto_request)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


# Actualizar un producto existente
@router.put(
    "/{producto_id}",
    response_model=ProductoRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar_producto(
    producto_id: int,
    datos: ProductoUpdate,
    service: ProductoService = Depends(ProductoService),
):
    try:
        return service.actualizar_producto(producto_id, datos)
    except (ProductoNoEncontrado, CategoriaNoEncontrada) as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.patch(
    "/{producto_id}/stock",
    response_model=ProductoRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar_stock(
    producto_id: int,
    datos: ProductoStockUpdate,
    service: ProductoService = Depends(ProductoService),
):
    try:
        return service.actualizar_stock(producto_id, datos)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


# Realiza la baja logica de un producto
@router.delete(
    "/{producto_id}",
    status_code=204,
    dependencies=[Depends(require_role(["admin"]))],
)
def eliminar_producto(
    producto_id: int,
    service: ProductoService = Depends(ProductoService),
):
    try:
        service.eliminar_producto(producto_id)
    except ProductoNoEncontrado as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
