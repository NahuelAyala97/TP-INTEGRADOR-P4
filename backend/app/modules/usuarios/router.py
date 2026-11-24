from typing import Annotated

from fastapi import APIRouter, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm

from app.core.config import settings
from app.core.deps import get_current_active_user, require_role

from . import service
from .schema import UserCreate, UserPublic

router = APIRouter(prefix="/api/v1", tags=["Usuarios y autenticación"])


# Registra un usuario
@router.post("/auth/register", response_model=UserPublic, status_code=201)
def registrar_usuario(datos: UserCreate):
    return service.registrar_usuario(datos)


# Inicia sesion y guarda el JWT en una cookie HttpOnly
@router.post("/auth/token")
def iniciar_sesion(
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    token = service.autenticar_usuario(
        form_data.username,
        form_data.password,
    )

    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        samesite="lax",
        secure=False,
    )

    return {"message": "Login exitoso"}


# Devuelve el usuario autenticado
@router.get("/auth/me", response_model=UserPublic)
def obtener_usuario_actual(
    usuario: Annotated[UserPublic, Depends(get_current_active_user)],
):
    return usuario


# Cierra la sesion
@router.post("/auth/logout")
def cerrar_sesion(response: Response):
    response.delete_cookie(
        key="access_token",
        path="/",
        httponly=True,
        samesite="lax",
        secure=False,
    )

    return {"message": "Sesion cerrada correctamente"}


# Lista los usuarios
@router.get("/admin/usuarios", response_model=list[UserPublic])
def listar_usuarios(
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
):
    return service.listar_usuarios()


# Desactiva un usuario
@router.post(
    "/admin/usuarios/{usuario_id}/desactivar",
    response_model=UserPublic,
)
def desactivar_usuario(
    usuario_id: int,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
):
    return service.desactivar_usuario(usuario_id, _admin.id)


# Activa un usuario
@router.post(
    "/admin/usuarios/{usuario_id}/activar",
    response_model=UserPublic,
)
def activar_usuario(
    usuario_id: int,
    _admin: Annotated[UserPublic, Depends(require_role(["admin"]))],
):
    return service.activar_usuario(usuario_id)
