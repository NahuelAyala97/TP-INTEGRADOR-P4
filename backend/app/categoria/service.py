from .model import Categoria
from .schema import CategoriaCreate, CategoriaRead, CategoriaUpdate
from .unit_of_work import CategoriaUnitOfWork


class CategoriaNoEncontrada(Exception):
    pass


class NombreDuplicado(Exception):
    pass


class CategoriaService:
    def __init__(self):
        self.uow = CategoriaUnitOfWork()

    def listar_categorias(self) -> list[CategoriaRead]:
        with self.uow as uow:
            categorias = uow.categorias.get_all()
            return [CategoriaRead.model_validate(c) for c in categorias]

    def obtener_categoria(self, categoria_id: int) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)

            if not categoria:
                raise CategoriaNoEncontrada("Categoria no encontrada")

            return CategoriaRead.model_validate(categoria)

    def crear_categoria(self, datos: CategoriaCreate) -> CategoriaRead:
        with self.uow as uow:
            if uow.categorias.obtener_por_nombre(datos.nombre):
                raise NombreDuplicado("El nombre ya existe")

            categoria = Categoria.model_validate(datos)
            uow.categorias.add(categoria)

            return CategoriaRead.model_validate(categoria)

    def actualizar_categoria(
        self, categoria_id: int, datos: CategoriaUpdate
    ) -> CategoriaRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)

            if not categoria:
                raise CategoriaNoEncontrada("Categoria no encontrada")

            cambios = datos.model_dump(exclude_unset=True, exclude_none=True)

            if "nombre" in cambios:
                existente = uow.categorias.obtener_por_nombre(cambios["nombre"])

                if existente and existente.id != categoria_id:
                    raise NombreDuplicado("El nombre ya existe")

            categoria.sqlmodel_update(cambios)
            uow.categorias.add(categoria)

            return CategoriaRead.model_validate(categoria)

    def eliminar_categoria(self, categoria_id: int) -> None:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(categoria_id)

            if not categoria:
                raise CategoriaNoEncontrada("Categoria no encontrada")

            categoria.activo = False
            uow.categorias.add(categoria)
