from app.core.unit_of_work import UnitOfWork

from .repository import UsuarioRepository


class UsuarioUnitOfWork(UnitOfWork):
    # Abre la sesion y prepara los repositorios
    def __enter__(self):
        super().__enter__()
        self.usuarios = UsuarioRepository(self.session)
        return self
