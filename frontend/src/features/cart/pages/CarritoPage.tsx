import { Link } from "react-router-dom";
import { useCartStore } from "@/store/cartStore";

// Formatea los precios en pesos argentinos
const formatoPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

export default function CarritoPage() {
  const items = useCartStore((state) => state.items);
  const quitar = useCartStore((state) => state.quitar);
  const cambiarCantidad = useCartStore((state) => state.cambiarCantidad);
  const vaciar = useCartStore((state) => state.vaciar);

  // Calcula el total de la compra
  const total = items.reduce(
    (acumulado, item) => acumulado + item.precio_unitario * item.cantidad,
    0,
  );

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-3xl font-bold">Mi carrito</h1>

        {items.length === 0 ? (
          // Muestra un mensaje cuando el carrito esta vacio
          <div className="rounded-lg bg-white p-8 text-center shadow-sm dark:bg-gray-900">
            <p className="mb-6 text-gray-600 dark:text-gray-400">
              Tu carrito está vacío.
            </p>

            <Link
              to="/"
              className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            {/* Listado de productos agregados */}
            <div className="space-y-4">
              {items.map((item) => (
                <article
                  key={item.producto_id}
                  className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                      <h2 className="text-lg font-semibold">{item.nombre}</h2>

                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                        Precio unitario:{" "}
                        {formatoPrecio.format(item.precio_unitario)}
                      </p>

                      <p className="mt-2 font-semibold">
                        Subtotal:{" "}
                        {formatoPrecio.format(
                          item.precio_unitario * item.cantidad,
                        )}
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Modifica la cantidad del producto */}
                      <div className="flex items-center rounded-md border border-gray-300 dark:border-gray-600">
                        <button
                          type="button"
                          aria-label={`Disminuir cantidad de ${item.nombre}`}
                          disabled={item.cantidad <= 1}
                          onClick={() =>
                            cambiarCantidad(item.producto_id, item.cantidad - 1)
                          }
                          className="cursor-pointer px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          -
                        </button>

                        <span className="min-w-8 text-center">
                          {item.cantidad}
                        </span>

                        {/* Aumenta la cantidad sin superar el stock */}
                        <button
                          type="button"
                          aria-label={`Aumentar cantidad de ${item.nombre}`}
                          disabled={item.cantidad >= item.stock}
                          onClick={() =>
                            cambiarCantidad(item.producto_id, item.cantidad + 1)
                          }
                          className="cursor-pointer px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          +
                        </button>
                      </div>
                      {/* Avisa cuando se alcanza el stock disponible */}
                      {item.cantidad >= item.stock && (
                        <span
                          role="status"
                          className="text-xs font-medium text-amber-600 dark:text-amber-400"
                        >
                          Stock máximo alcanzado
                        </span>
                      )}

                      {/* Elimina el producto del carrito */}
                      <button
                        type="button"
                        onClick={() => quitar(item.producto_id)}
                        className="cursor-pointer text-sm text-red-600 hover:underline dark:text-red-400"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Resumen de la compra */}
            <section className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">Total</span>

                <span className="text-2xl font-bold">
                  {formatoPrecio.format(total)}
                </span>
              </div>

              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                Los precios y el stock se verificarán nuevamente al confirmar el
                pedido.
              </p>

              <div className="mt-6 flex flex-wrap justify-between gap-3">
                <button
                  type="button"
                  onClick={vaciar}
                  className="cursor-pointer rounded-md border border-red-500 px-4 py-2 text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-gray-800"
                >
                  Vaciar carrito
                </button>

                <Link
                  to="/"
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  Seguir comprando
                </Link>

                {/* Permite continuar al checkout */}
                <Link
                  to="/checkout"
                  className="rounded-md bg-green-600 px-4 py-2 text-center font-medium text-white hover:bg-green-700"
                >
                  Finalizar compra
                </Link>
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
