from app.categoria.repository import CategoriaRepository
from app.core.unit_of_work import UnitOfWork

from .repository import ProductoRepository


class ProductoUnitOfWork(UnitOfWork):
    def __enter__(self):
        super().__enter__()
        self.productos = ProductoRepository(self.session)
        self.categorias = CategoriaRepository(self.session)
        return self
