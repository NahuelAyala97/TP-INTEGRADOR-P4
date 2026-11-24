import { useAdminPedidos } from "../hooks/usePedidos";
import { EstadoCarga, EstadoError } from "@/shared/components/Estados";

import type { EstadoPedido } from "../types/pedido";

// Transiciones permitidas para cada estado
const transiciones: Record<EstadoPedido, EstadoPedido[]> = {
  PENDIENTE: ["EN_PREPARACION", "CANCELADO"],
  EN_PREPARACION: ["ENTREGADO", "CANCELADO"],
  ENTREGADO: [],
  CANCELADO: [],
};

const estados: EstadoPedido[] = [
  "PENDIENTE",
  "EN_PREPARACION",
  "ENTREGADO",
  "CANCELADO",
];

// Formatea los importes
const formatoPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

export default function AdminPedidosPage() {
  // Obtiene los datos y acciones desde el hook
  const {
    pagina,
    setPagina,
    filtroEstado,
    cambiarFiltroEstado,
    pedidos,
    totalPaginas,
    error,
    isPending,
    isError,
    cambiandoEstado,
    cambiarEstado,
  } = useAdminPedidos();

  // A partir de aqui se conserva el JSX existente

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-bold">Administración de pedidos</h1>

        {/* Filtro por estado */}
        <div className="mb-6">
          <label
            htmlFor="filtro-estado"
            className="mb-2 block text-sm font-medium"
          >
            Filtrar por estado
          </label>

          <select
            id="filtro-estado"
            value={filtroEstado}
            onChange={(e) => {
              cambiarFiltroEstado(e.target.value as EstadoPedido | "");
            }}
            className="rounded-md border border-gray-300 bg-white px-3 py-2 dark:border-gray-600 dark:bg-gray-800"
          >
            <option value="">Todos los estados</option>

            {estados.map((estado) => (
              <option key={estado} value={estado}>
                {estado.replaceAll("_", " ")}
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p
            role="alert"
            className="mb-4 text-sm text-red-600 dark:text-red-400"
          >
            {error}
          </p>
        )}

        {isPending ? (
          <EstadoCarga mensaje="Cargando pedidos..." />
        ) : isError ? (
          <EstadoError mensaje="No se pudieron cargar los pedidos." />
        ) : pedidos.length === 0 ? (
          <p className="rounded-lg bg-white p-6 text-center dark:bg-gray-900">
            No hay pedidos para mostrar.
          </p>
        ) : (
          <>
            {/* Tabla de pedidos */}
            <div className="overflow-x-auto rounded-lg bg-white shadow-sm dark:bg-gray-900">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-100 dark:bg-gray-800">
                  <tr>
                    <th className="p-4">Pedido</th>
                    <th className="p-4">Usuario</th>
                    <th className="p-4">Fecha</th>
                    <th className="p-4">Productos</th>
                    <th className="p-4">Total</th>
                    <th className="p-4">Estado</th>
                    <th className="p-4">Acción</th>
                  </tr>
                </thead>

                <tbody>
                  {pedidos.map((pedido) => (
                    <tr
                      key={pedido.id}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <td className="p-4 font-medium">#{pedido.id}</td>

                      <td className="p-4">#{pedido.usuario_id}</td>

                      <td className="p-4">
                        {new Date(pedido.created_at).toLocaleDateString(
                          "es-AR",
                        )}
                      </td>

                      <td className="p-4">
                        {pedido.items.map((item, index) => (
                          <p key={index}>
                            {item.nombre_producto} × {item.cantidad}
                          </p>
                        ))}
                      </td>

                      <td className="p-4 font-medium">
                        {formatoPrecio.format(pedido.total)}
                      </td>

                      <td className="p-4">
                        {pedido.estado.replaceAll("_", " ")}
                      </td>

                      <td className="p-4">
                        {transiciones[pedido.estado].length > 0 ? (
                          // Solo muestra estados permitidos
                          <select
                            key={`${pedido.id}-${pedido.estado}`}
                            defaultValue=""
                            disabled={cambiandoEstado}
                            onChange={(e) => {
                              cambiarEstado(
                                pedido.id,
                                e.target.value as EstadoPedido,
                              );
                            }}
                            className="rounded-md border border-gray-300 bg-white px-2 py-2 dark:border-gray-600 dark:bg-gray-800"
                          >
                            <option value="" disabled>
                              Cambiar estado
                            </option>

                            {transiciones[pedido.estado].map((estado) => (
                              <option key={estado} value={estado}>
                                {estado.replaceAll("_", " ")}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-500 dark:text-gray-400">
                            Finalizado
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginacion */}
            <div className="mt-6 flex items-center justify-center gap-4">
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
