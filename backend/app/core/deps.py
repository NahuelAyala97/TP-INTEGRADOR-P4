from typing import Annotated

from fastapi import Depends, HTTPException, Request
from fastapi.security import OAuth2PasswordBearer

from app.core.security import decode_access_token
from app.modules.usuarios.schema import UserPublic
from app.modules.usuarios.unit_of_work import UsuarioUnitOfWork


# Obtiene el JWT desde la cookie HttpOnly
class OAuth2PasswordBearerWithCookie(OAuth2PasswordBearer):
    async def __call__(self, request: Request) -> str:
        token = request.cookies.get("access_token")

        if not token:
            raise HTTPException(
                status_code=401,
                detail="No autenticado",
            )

        return token


oauth2_scheme = OAuth2PasswordBearerWithCookie(tokenUrl="/api/v1/auth/token")


# Obtiene el usuario autenticado
def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
) -> UserPublic:

    datos = decode_access_token(token)

    if not datos or not isinstance(datos.get("sub"), str):
        raise HTTPException(
            status_code=401,
            detail="Credenciales inválidas o token expirado",
        )

    with UsuarioUnitOfWork() as uow:
        usuario = uow.usuarios.obtener_por_username(datos["sub"])

        if not usuario:
            raise HTTPException(
                status_code=401,
                detail="Usuario no encontrado",
            )

        return UserPublic.model_validate(usuario)


# Verifica que la cuenta esté activa
def get_current_active_user(
    usuario: Annotated[UserPublic, Depends(get_current_user)],
) -> UserPublic:

    if usuario.disabled:
        raise HTTPException(
            status_code=400,
            detail="Cuenta de usuario desactivada",
        )

    return usuario


# Verifica que el usuario tenga un rol permitido
def require_role(allowed_roles: list[str]):

    def role_checker(
        usuario: Annotated[UserPublic, Depends(get_current_active_user)],
    ) -> UserPublic:

        if usuario.role not in allowed_roles:
            raise HTTPException(
                status_code=403,
                detail="Permisos insuficientes",
            )

        return usuario

    return role_checker
