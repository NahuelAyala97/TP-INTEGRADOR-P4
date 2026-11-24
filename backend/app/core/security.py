from datetime import UTC, datetime, timedelta

from jose import JWTError, jwt
from passlib.context import CryptContext

from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

if len(settings.SECRET_KEY) < 32:
    raise RuntimeError("SECRET_KEY debe tener al menos 32 caracteres")


# Genera el hash de una contraseña
def hash_password(password: str) -> str:
    if len(password.encode("utf-8")) > 72:
        raise ValueError("La contraseña no puede superar los 72 bytes")

    return pwd_context.hash(password)


# Verifica una contraseña con su hash
def verify_password(password: str, password_hash: str) -> bool:
    try:
        return pwd_context.verify(password, password_hash)
    except ValueError:
        return False


# Genera un JWT para el usuario autenticado
def create_access_token(username: str) -> str:
    expire = datetime.now(UTC) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)

    datos = {
        "sub": username,
        "type": "access",
        "exp": expire,
    }

    return jwt.encode(
        datos,
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM,
    )


# Valida un JWT y devuelve sus datos
def decode_access_token(token: str) -> dict | None:
    try:
        datos = jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM],
        )

        if datos.get("type") != "access" or not datos.get("sub") or "exp" not in datos:
            return None

        return datos

    except JWTError:
        return None
