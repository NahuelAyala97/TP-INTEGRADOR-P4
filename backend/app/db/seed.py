from sqlmodel import Session, select

from app.categoria.model import Categoria
from app.core.database import create_all_tables, engine
from app.core.security import hash_password
from app.modules.usuarios.model import Usuario
from app.pedido import model as pedido_model
from app.producto.model import Producto


def cargar_datos():
    create_all_tables()

    with Session(engine) as session:
        # Usuario administrador
        admin = session.exec(select(Usuario).where(Usuario.username == "admin")).first()

        if admin is None:
            session.add(
                Usuario(
                    username="admin",
                    full_name="Administrador",
                    email="admin@foodstore.com",
                    hashed_password=hash_password("Admin1234!"),
                    role="admin",
                )
            )

        # Categorias
        categorias = [
            ("Hamburguesas", "Hamburguesas del local"),
            ("Pizzas", "Pizzas del local"),
            ("Bebidas", "Bebidas disponibles"),
        ]

        for nombre, descripcion in categorias:
            categoria = session.exec(
                select(Categoria).where(Categoria.nombre == nombre)
            ).first()

            if categoria is None:
                session.add(Categoria(nombre=nombre, descripcion=descripcion))

        session.flush()

        # Productos
        productos = [
            ("Hamburguesa clasica", 5000, 20, "Hamburguesas"),
            ("Hamburguesa completa", 6500, 15, "Hamburguesas"),
            ("Hamburguesa doble", 7500, 10, "Hamburguesas"),
            ("Pizza muzzarella", 8000, 15, "Pizzas"),
            ("Pizza napolitana", 9500, 10, "Pizzas"),
            ("Pizza especial", 11000, 8, "Pizzas"),
            ("Gaseosa 500ml", 2500, 30, "Bebidas"),
            ("Agua mineral", 1800, 25, "Bebidas"),
        ]

        for nombre, precio, stock, nombre_categoria in productos:
            producto = session.exec(
                select(Producto).where(Producto.nombre == nombre)
            ).first()

            if producto is None:
                categoria = session.exec(
                    select(Categoria).where(Categoria.nombre == nombre_categoria)
                ).first()

                session.add(
                    Producto(
                        nombre=nombre,
                        precio_base=precio,
                        stock=stock,
                        categoria_id=categoria.id,
                    )
                )

        session.commit()

    print("Datos iniciales cargados correctamente")


if __name__ == "__main__":
    cargar_datos()
