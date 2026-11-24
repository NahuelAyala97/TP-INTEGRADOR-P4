from sqlmodel import Session, select

from .model import Usuario


class UsuarioRepository:
    def __init__(self, session: Session):
        self.session = session

    # Lista todos los usuarios
    def listar(self) -> list[Usuario]:
        return list(self.session.exec(select(Usuario)).all())

    # Busca un usuario por su id
    def obtener_por_id(self, usuario_id: int) -> Usuario | None:
        return self.session.get(Usuario, usuario_id)

    # Busca un usuario por su username
    def obtener_por_username(self, username: str) -> Usuario | None:
        statement = select(Usuario).where(Usuario.username == username)
        return self.session.exec(statement).first()

    # Busca un usuario por su email
    def obtener_por_email(self, email: str) -> Usuario | None:
        statement = select(Usuario).where(Usuario.email == email)
        return self.session.exec(statement).first()

    # Guarda un usuario nuevo o modificado
    def guardar(self, usuario: Usuario) -> Usuario:
        self.session.add(usuario)
        self.session.flush()
        return usuario
