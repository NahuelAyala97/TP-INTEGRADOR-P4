import { useResumenPedidos } from "../hooks/usePedidos";
import { EstadoCarga, EstadoError } from "@/shared/components/Estados";

// Formatea los importes en pesos argentinos
const formatoPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

export default function AdminResumenPage() {
  // Obtiene los indicadores desde el hook
  const { resumen, cargandoResumen, errorResumen } = useResumenPedidos();

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-6 text-3xl font-bold">Resumen administrativo</h1>

        {cargandoResumen ? (
          <EstadoCarga mensaje="Cargando resumen..." />
        ) : errorResumen ? (
          <EstadoError mensaje="No se pudo cargar el resumen." />
        ) : resumen ? (
          // Muestra los seis indicadores administrativos
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { titulo: "Pendientes", valor: resumen.pendientes },
              { titulo: "En preparación", valor: resumen.en_preparacion },
              { titulo: "Entregados", valor: resumen.entregados },
              { titulo: "Cancelados", valor: resumen.cancelados },
              { titulo: "Pedidos de hoy", valor: resumen.pedidos_hoy },
              {
                titulo: "Ingresos entregados",
                valor: formatoPrecio.format(resumen.ingresos_entregados),
              },
            ].map((indicador) => (
              <div
                key={indicador.titulo}
                className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
              >
                <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                  {indicador.titulo}
                </p>

                <p className="text-2xl font-bold">{indicador.valor}</p>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
