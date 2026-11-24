import { useState } from "react";

import { useCategories } from "@/features/categories/hooks/useCategories";
import { useProducts } from "@/features/products/hooks/useProducts";
import { useCartStore } from "@/store/cartStore";
import { useNotificationStore } from "@/store/notificationStore";
import { EstadoError } from "@/shared/components/Estados";

import type { Producto } from "@/features/products/types/producto";

const LIMITE = 8;

export default function CatalogoPage() {
  const [busqueda, setBusqueda] = useState("");
  const [categoriaId, setCategoriaId] = useState("");
  const [pagina, setPagina] = useState(0);

  const { categorias } = useCategories();

  // Obtiene los productos segun los filtros seleccionados
  const { productos, total, isPending, isError } = useProducts({
    skip: pagina * LIMITE,
    limit: LIMITE,
    search: busqueda || undefined,
    categoria_id: categoriaId ? Number(categoriaId) : undefined,
  });

  const agregar = useCartStore((state) => state.agregar);
  const itemsCarrito = useCartStore((state) => state.items);

  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  );

  const totalPaginas = Math.max(1, Math.ceil(total / LIMITE));

  // Agrega un producto respetando el stock disponible
  function agregarAlCarrito(producto: Producto) {
    const item = itemsCarrito.find((item) => item.producto_id === producto.id);

    if (item && item.cantidad >= producto.stock) {
      showNotification("No hay mas stock disponible");
      return;
    }

    agregar(producto);
    showNotification("Producto agregado al carrito");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10 dark:bg-gray-950 dark:text-gray-100">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-2 text-3xl font-bold">Catálogo de productos</h1>

        <p className="mb-8 text-gray-600 dark:text-gray-400">
          Explorá nuestros productos y agregá tus favoritos al carrito.
        </p>

        {/* Busqueda y filtro por categoria */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <input
            type="search"
            placeholder="Buscar productos..."
            value={busqueda}
            onChange={(e) => {
              setBusqueda(e.target.value);
              setPagina(0);
            }}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
          />

          <select
            value={categoriaId}
            onChange={(e) => {
              setCategoriaId(e.target.value);
              setPagina(0);
            }}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-800"
          >
            <option value="">Todas las categorías</option>

            {categorias.map((categoria) => (
              <option key={categoria.id} value={categoria.id}>
                {categoria.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Muestra tarjetas de carga mientras se consultan los productos */}
        {isPending ? (
          <div
            role="status"
            aria-label="Cargando productos"
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4"
          >
            {Array.from({ length: LIMITE }).map((_, index) => (
              <div
                key={index}
                className="animate-pulse overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
              >
                {/* Espacio reservado para la imagen */}
                <div className="h-44 bg-gray-200 dark:bg-gray-700" />

                {/* Espacios reservados para los datos */}
                <div className="space-y-3 p-4">
                  <div className="h-3 w-1/3 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-5 w-3/4 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-full rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="h-3 w-2/3 rounded bg-gray-200 dark:bg-gray-700" />
                  <div className="mt-4 h-9 rounded bg-gray-200 dark:bg-gray-700" />
                </div>
              </div>
            ))}
            <span className="sr-only">Cargando productos...</span>
          </div>
        ) : isError ? (
          <EstadoError mensaje="No se pudieron cargar los productos." />
        ) : productos.length === 0 ? (
          <p className="py-10 text-center text-gray-500 dark:text-gray-400">
            No se encontraron productos.
          </p>
        ) : (
          <>
            {/* Tarjetas de productos */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {productos.map((producto) => {
                const cantidadEnCarrito =
                  itemsCarrito.find((item) => item.producto_id === producto.id)
                    ?.cantidad ?? 0;

                const puedeAgregar =
                  producto.disponible && producto.stock > cantidadEnCarrito;

                return (
                  <article
                    key={producto.id}
                    className="flex flex-col overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
                  >
                    {/* Imagen del producto */}
                    <div className="flex h-44 items-center justify-center bg-gray-100 dark:bg-gray-800">
                      {producto.imagen_url ? (
                        <img
                          src={producto.imagen_url}
                          alt={producto.nombre}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="text-sm text-gray-400">
                          Sin imagen
                        </span>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col p-4">
                      <span className="mb-1 text-xs text-gray-500 dark:text-gray-400">
                        {producto.categoria.nombre}
                      </span>

                      <h2 className="mb-2 text-lg font-semibold">
                        {producto.nombre}
                      </h2>

                      <p className="mb-4 flex-1 text-sm text-gray-600 dark:text-gray-400">
                        {producto.descripcion}
                      </p>

                      <p className="mb-2 text-xl font-bold">
                        {producto.precio_base.toLocaleString("es-AR", {
                          style: "currency",
                          currency: "ARS",
                        })}
                      </p>

                      <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
                        {producto.stock > 0
                          ? `Stock: ${producto.stock}`
                          : "Sin stock"}
                      </p>

                      <button
                        type="button"
                        disabled={!puedeAgregar}
                        onClick={() => agregarAlCarrito(producto)}
                        className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                      >
                        {!producto.disponible || producto.stock === 0
                          ? "No disponible"
                          : !puedeAgregar
                            ? "Máximo en carrito"
                            : "Agregar al carrito"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>

            {/* Paginacion desde el backend */}
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
