import { Link } from "react-router-dom";

import { useMisPedidos } from "../hooks/usePedidos";
import { EstadoCarga, EstadoError } from "@/shared/components/Estados";

// Formatea los precios en pesos argentinos
const formatoPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

export default function MisPedidosPage() {
  // Obtiene los datos y acciones desde el hook
  const {
    pagina,
    setPagina,
    pedidos,
    totalPaginas,
    error,
    isPending,
    isError,
    cancelando,
    cancelandoId,
    confirmarCancelacion,
  } = useMisPedidos();

  // A partir de aqui se conserva el JSX existente

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-3xl font-bold">Mis pedidos</h1>

        {error && (
          <p
            role="alert"
            className="mb-5 text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        )}

        {isPending ? (
          <EstadoCarga mensaje="Cargando pedidos..." />
        ) : isError ? (
          <EstadoError mensaje="No se pudieron cargar los pedidos." />
        ) : pedidos.length === 0 ? (
          <div className="rounded-lg bg-white p-8 text-center shadow-sm dark:bg-gray-900">
            <p className="mb-5 text-gray-600 dark:text-gray-400">
              Todavía no tenés pedidos registrados.
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
            {/* Listado de pedidos del usuario */}
            <div className="space-y-5">
              {pedidos.map((pedido) => (
                <article
                  key={pedido.id}
                  className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold">
                        Pedido #{pedido.id}
                      </h2>

                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(pedido.created_at).toLocaleString("es-AR")}
                      </p>
                    </div>

                    <span className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-800 dark:bg-gray-700 dark:text-gray-100">
                      {pedido.estado.replaceAll("_", " ")}
                    </span>
                  </div>

                  {/* Productos incluidos en el pedido */}
                  <div className="space-y-2 border-y border-gray-200 py-4 dark:border-gray-700">
                    {pedido.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex justify-between gap-4 text-sm"
                      >
                        <span>
                          {item.nombre_producto} × {item.cantidad}
                        </span>

                        <span>{formatoPrecio.format(item.subtotal)}</span>
                      </div>
                    ))}
                  </div>

                  {/* Datos y total del pedido */}
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Entrega: {pedido.direccion_entrega}
                    </p>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Pago: {pedido.forma_pago}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                      <p className="text-xl font-bold">
                        Total: {formatoPrecio.format(pedido.total)}
                      </p>

                      {/* Solo permite cancelar pedidos pendientes */}
                      {pedido.estado === "PENDIENTE" && (
                        <button
                          type="button"
                          disabled={cancelando}
                          onClick={() => confirmarCancelacion(pedido.id)}
                          className="cursor-pointer rounded-md border border-red-500 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:text-red-400 dark:hover:bg-gray-800"
                        >
                          {cancelandoId === pedido.id
                            ? "Cancelando..."
                            : "Cancelar pedido"}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Paginacion */}
            <div className="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                disabled={pagina === 0}
                onClick={() => setPagina((actual) => actual - 1)}
                className="cursor-pointer rounded-md border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>

              <span className="text-sm">
                Página {pagina + 1} de {totalPaginas}
              </span>

              <button
                type="button"
                disabled={pagina + 1 >= totalPaginas}
                onClick={() => setPagina((actual) => actual + 1)}
                className="cursor-pointer rounded-md border px-4 py-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
