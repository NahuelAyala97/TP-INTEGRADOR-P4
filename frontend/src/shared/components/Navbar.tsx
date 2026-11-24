import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { useThemeStore } from "@/store/themeStore";
import { useCartStore } from "@/store/cartStore";

export default function Navbar() {
  const { usuario, logout } = useAuth();
  const navigate = useNavigate();

  const darkMode = useThemeStore((state) => state.darkMode);
  const toggleTheme = useThemeStore((state) => state.toggleTheme);

  // Aplica el tema seleccionado
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Cierra la sesion del usuario
  const cerrarSesion = async () => {
    try {
      await logout();
      navigate("/login", { replace: true });
    } catch {
      alert("No se pudo confirmar el cierre de sesión en el servidor.");
    }
  };

  // Calcula la cantidad total de unidades en el carrito
  const cantidadCarrito = useCartStore((state) =>
    state.items.reduce((total, item) => total + item.cantidad, 0),
  );

  return (
    <nav className="border-b border-gray-200 bg-white px-6 py-4 text-gray-900 dark:border-gray-700 dark:bg-gray-900 dark:text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between">
        <h1 className="text-xl font-bold">
          <Link to="/">Food Store</Link>
        </h1>

        <div className="flex items-center gap-6">
          <Link
            to="/carrito"
            className="flex items-center gap-2 hover:text-blue-600"
          >
            Mi carrito
            {cantidadCarrito > 0 && (
              <span className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-semibold text-white">
                {cantidadCarrito}
              </span>
            )}
          </Link>
          {usuario ? (
            <>
              {/* Historial de pedidos del cliente */}
              {usuario.role === "user" && (
                <Link to="/mis-pedidos" className="hover:text-blue-600">
                  Mis pedidos
                </Link>
              )}

              {/* Opciones exclusivas del administrador */}
              {usuario.role === "admin" && (
                <>
                  <Link to="/admin/categorias" className="hover:text-blue-600">
                    Categorías
                  </Link>

                  <Link to="/admin/productos" className="hover:text-blue-600">
                    Productos
                  </Link>

                  <Link to="/admin/pedidos" className="hover:text-blue-600">
                    Pedidos
                  </Link>

                  <Link to="/admin/usuarios" className="hover:text-blue-600">
                    Usuarios
                  </Link>
                  <Link to="/admin/resumen" className="hover:text-blue-600">
                    Resumen
                  </Link>
                </>
              )}

              <span className="text-gray-600 dark:text-gray-300">
                {usuario.full_name} ({usuario.role})
              </span>

              <button
                type="button"
                onClick={() => void cerrarSesion()}
                className="cursor-pointer text-red-600 hover:text-red-700"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-blue-600">
                Iniciar sesión
              </Link>

              <Link to="/register" className="hover:text-blue-600">
                Registrarse
              </Link>
            </>
          )}

          <button
            type="button"
            onClick={toggleTheme}
            className="cursor-pointer rounded-md border border-gray-300 px-3 py-2 text-sm dark:border-gray-600"
          >
            {darkMode ? "Modo claro" : "Modo oscuro"}
          </button>
        </div>
      </div>
    </nav>
  );
}
