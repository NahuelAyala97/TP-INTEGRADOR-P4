import { Link, Navigate } from "react-router-dom";

import { useCheckout } from "../hooks/usePedidos";
import type { FormaPago } from "../types/pedido";

// Formatea los importes en pesos argentinos
const formatoPrecio = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
});

export default function CheckoutPage() {
  // Obtiene del hook los datos necesarios para mostrar la pagina
  const { items, total, rol, error, pedidoCreado, form } = useCheckout();

  // Redirige al historial despues de confirmar la compra
  if (pedidoCreado !== null) {
    return (
      <Navigate
        to={rol === "admin" ? "/admin/pedidos" : "/mis-pedidos"}
        replace
      />
    );
  }

  // A partir de aqui se conserva el JSX existente

  // Evita confirmar una compra sin productos
  if (items.length === 0) {
    return (
      <main className="min-h-screen bg-gray-50 px-6 py-12 dark:bg-gray-950 dark:text-gray-100">
        <div className="mx-auto max-w-md rounded-lg bg-white p-8 text-center shadow-md dark:bg-gray-900">
          <h1 className="mb-4 text-2xl font-bold">Tu carrito está vacío</h1>

          <Link
            to="/"
            className="inline-block rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
          >
            Ver productos
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto max-w-2xl">
        <h1 className="mb-6 text-3xl font-bold">Confirmar pedido</h1>

        {/* Resumen de los productos seleccionados */}
        <section className="mb-6 rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
          <h2 className="mb-4 text-xl font-semibold">Resumen de compra</h2>

          <div className="space-y-3">
            {items.map((item) => (
              <div
                key={item.producto_id}
                className="flex justify-between gap-4 border-b border-gray-200 pb-3 dark:border-gray-700"
              >
                <span>
                  {item.nombre} × {item.cantidad}
                </span>

                <span className="font-medium">
                  {formatoPrecio.format(item.precio_unitario * item.cantidad)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex justify-between text-xl font-bold">
            <span>Total estimado</span>
            <span>{formatoPrecio.format(total)}</span>
          </div>

          <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            El backend verificará el stock y calculará el importe definitivo al
            confirmar el pedido.
          </p>
        </section>

        {/* Datos de entrega y pago */}
        <section className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-900">
          <h2 className="mb-5 text-xl font-semibold">Datos del pedido</h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void form.handleSubmit();
            }}
          >
            {/* Direccion de entrega */}
            <form.Field
              name="direccion_entrega"
              validators={{
                onChange: ({ value }) =>
                  value.trim() ? undefined : "La dirección es obligatoria",
              }}
            >
              {(field) => (
                <div className="mb-5">
                  <label
                    htmlFor={field.name}
                    className="mb-2 block font-medium"
                  >
                    Dirección de entrega
                  </label>

                  <input
                    id={field.name}
                    name={field.name}
                    type="text"
                    required
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Calle, altura y localidad"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />

                  {field.state.meta.isTouched && !field.state.meta.isValid && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {field.state.meta.errors.join(", ")}
                    </p>
                  )}
                </div>
              )}
            </form.Field>

            {/* Forma de pago */}
            <form.Field name="forma_pago">
              {(field) => (
                <div className="mb-5">
                  <label
                    htmlFor={field.name}
                    className="mb-2 block font-medium"
                  >
                    Forma de pago
                  </label>

                  <select
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) =>
                      field.handleChange(e.target.value as FormaPago)
                    }
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TRANSFERENCIA">Transferencia</option>
                  </select>
                </div>
              )}
            </form.Field>

            {/* Notas opcionales */}
            <form.Field name="notas">
              {(field) => (
                <div className="mb-6">
                  <label
                    htmlFor={field.name}
                    className="mb-2 block font-medium"
                  >
                    Notas (opcional)
                  </label>

                  <textarea
                    id={field.name}
                    name={field.name}
                    rows={3}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="Indicaciones para la entrega"
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                  />
                </div>
              )}
            </form.Field>

            {/* Errores de la API */}
            {error && (
              <p
                role="alert"
                className="mb-4 text-sm text-red-600 dark:text-red-400"
              >
                {error}
              </p>
            )}

            <div className="flex items-center justify-between gap-4">
              <Link
                to="/carrito"
                className="text-sm text-blue-600 hover:underline dark:text-blue-400"
              >
                Volver al carrito
              </Link>

              <form.Subscribe
                selector={(state) => [state.canSubmit, state.isSubmitting]}
              >
                {([canSubmit, isSubmitting]) => (
                  <button
                    type="submit"
                    disabled={!canSubmit || isSubmitting}
                    className="cursor-pointer rounded-md bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {isSubmitting ? "Confirmando..." : "Confirmar pedido"}
                  </button>
                )}
              </form.Subscribe>
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}
