from .model import Producto
from .schema import (
    ProductoCreate,
    ProductoRead,
    ProductosPaginados,
    ProductoStockUpdate,
    ProductoUpdate,
)
from .unit_of_work import ProductoUnitOfWork


class ProductoNoEncontrado(Exception):
    pass


class CategoriaNoEncontrada(Exception):
    pass


class ProductoService:
    def __init__(self):
        self.uow = ProductoUnitOfWork()

    # Obtiene todos los productos
    def listar_productos(
        self,
        skip: int = 0,
        limit: int = 20,
        search: str | None = None,
        categoria_id: int | None = None,
        disponible: bool | None = None,
    ) -> ProductosPaginados:
        with self.uow as uow:
            total, productos = uow.productos.search(
                skip, limit, search, categoria_id, disponible
            )
            return ProductosPaginados(
                total=total, items=[ProductoRead.model_validate(p) for p in productos]
            )

    # Obtiene un producto por su id
    def obtener_producto(self, producto_id: int) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)

            if not producto:
                raise ProductoNoEncontrado("Producto no encontrado")

            return ProductoRead.model_validate(producto)

    # Crea un nuevo producto
    def crear_producto(self, datos: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            categoria = uow.categorias.get_by_id(datos.categoria_id)

            if not categoria:
                raise CategoriaNoEncontrada("Categoria no encontrada")

            producto = Producto.model_validate(datos)
            uow.productos.add(producto)

            return ProductoRead.model_validate(producto)

    # Actualiza un producto existente
    def actualizar_producto(
        self, producto_id: int, producto_request: ProductoUpdate
    ) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)

            if not producto:
                raise ProductoNoEncontrado("Producto no encontrado")

            cambios = producto_request.model_dump(exclude_unset=True, exclude_none=True)

            if "categoria_id" in cambios:
                categoria = uow.categorias.get_by_id(cambios.pop("categoria_id"))

                if not categoria:
                    raise CategoriaNoEncontrada("Categoria no encontrada")

                producto.categoria = categoria

            producto.sqlmodel_update(cambios)
            uow.productos.add(producto)

            return ProductoRead.model_validate(producto)

    def actualizar_stock(
        self, producto_id: int, datos: ProductoStockUpdate
    ) -> ProductoRead:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)

            if not producto:
                raise ProductoNoEncontrado("Producto no encontrado")

            producto.sqlmodel_update(datos.model_dump())
            uow.productos.add(producto)

            return ProductoRead.model_validate(producto)

    # baja logica
    def eliminar_producto(self, producto_id: int) -> None:
        with self.uow as uow:
            producto = uow.productos.get_by_id(producto_id)

            if not producto:
                raise ProductoNoEncontrado("Producto no encontrado")

            producto.activo = False

            uow.productos.add(producto)
