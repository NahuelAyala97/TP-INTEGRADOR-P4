from fastapi import APIRouter, Depends, HTTPException

from app.core.deps import require_role

from .schema import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .service import CategoriaNoEncontrada, CategoriaService, NombreDuplicado

router = APIRouter(prefix="/categorias", tags=["categorias"])


@router.get("", response_model=list[CategoriaRead])
def listar_categorias(
    service: CategoriaService = Depends(CategoriaService),
):
    return service.listar_categorias()


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(
    categoria_id: int,
    service: CategoriaService = Depends(CategoriaService),
):
    try:
        return service.obtener_categoria(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc


@router.post(
    "",
    response_model=CategoriaRead,
    status_code=201,
    dependencies=[Depends(require_role(["admin"]))],
)
def crear_categoria(
    datos: CategoriaCreate,
    service: CategoriaService = Depends(CategoriaService),
):
    try:
        return service.crear_categoria(datos)
    except NombreDuplicado as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.put(
    "/{categoria_id}",
    response_model=CategoriaRead,
    dependencies=[Depends(require_role(["admin"]))],
)
def actualizar_categoria(
    categoria_id: int,
    datos: CategoriaUpdate,
    service: CategoriaService = Depends(CategoriaService),
):
    try:
        return service.actualizar_categoria(categoria_id, datos)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except NombreDuplicado as exc:
        raise HTTPException(status_code=409, detail=str(exc)) from exc


@router.delete(
    "/{categoria_id}",
    status_code=204,
    dependencies=[Depends(require_role(["admin"]))],
)
def eliminar_categoria(
    categoria_id: int,
    service: CategoriaService = Depends(CategoriaService),
):
    try:
        service.eliminar_categoria(categoria_id)
    except CategoriaNoEncontrada as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
