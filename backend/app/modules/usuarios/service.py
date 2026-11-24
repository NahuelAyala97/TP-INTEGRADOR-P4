from fastapi import HTTPException

from app.core.security import (
    create_access_token,
    hash_password,
    verify_password,
)

from .model import Usuario
from .schema import UserCreate, UserPublic
from .unit_of_work import UsuarioUnitOfWork


# Registra un usuario con rol user
def registrar_usuario(datos: UserCreate) -> UserPublic:
    with UsuarioUnitOfWork() as uow:
        if uow.usuarios.obtener_por_username(datos.username):
            raise HTTPException(
                status_code=409,
                detail="El username ya está registrado",
            )

        if uow.usuarios.obtener_por_email(datos.email):
            raise HTTPException(
                status_code=409,
                detail="El email ya está registrado",
            )

        usuario = Usuario(
            username=datos.username,
            full_name=datos.full_name,
            email=datos.email,
            hashed_password=hash_password(datos.password),
            role="user",
        )

        uow.usuarios.guardar(usuario)

        return UserPublic.model_validate(usuario)


# Valida las credenciales y genera el JWT
def autenticar_usuario(username: str, password: str) -> str:
    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.obtener_por_username(username)

        if not usuario or not verify_password(password, usuario.hashed_password):
            raise HTTPException(
                status_code=401,
                detail="Credenciales incorrectas",
            )

        if usuario.disabled:
            raise HTTPException(
                status_code=400,
                detail="Cuenta de usuario desactivada",
            )

        return create_access_token(usuario.username)


# Lista todos los usuarios
def listar_usuarios() -> list[UserPublic]:
    with UsuarioUnitOfWork() as uow:
        usuarios = uow.usuarios.listar()

        return [UserPublic.model_validate(usuario) for usuario in usuarios]


# Desactiva un usuario
def desactivar_usuario(usuario_id: int, admin_id: int) -> UserPublic:
    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.obtener_por_id(usuario_id)

        if not usuario:
            raise HTTPException(
                status_code=404,
                detail="Usuario no encontrado",
            )

        if usuario.id == admin_id:
            raise HTTPException(
                status_code=400,
                detail="No puedes desactivar tu propia cuenta",
            )

        if not usuario.disabled:
            usuario.disabled = True
            uow.usuarios.guardar(usuario)

        return UserPublic.model_validate(usuario)


# Activa un usuario
def activar_usuario(usuario_id: int) -> UserPublic:
    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.obtener_por_id(usuario_id)

        if not usuario:
            raise HTTPException(
                status_code=404,
                detail="Usuario no encontrado",
            )

        if usuario.disabled:
            usuario.disabled = False
            uow.usuarios.guardar(usuario)

        return UserPublic.model_validate(usuario)
