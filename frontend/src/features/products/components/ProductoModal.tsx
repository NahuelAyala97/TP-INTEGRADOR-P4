import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";

import { useCategories } from "@/features/categories/hooks/useCategories";

import type { Producto } from "../types/producto";
import type { ProductoRequest } from "../services/producto";

interface ProductoModalProps {
  abierto: boolean;
  producto: Producto | null;
  onCerrar: () => void;
  onGuardar: (datos: ProductoRequest) => void;
}

export default function ProductoModal({
  abierto,
  producto,
  onCerrar,
  onGuardar,
}: ProductoModalProps) {
  // Obtiene las categorias activas desde el backend
  const { categorias, isPending, isError } = useCategories();

  // Configura el formulario
  const form = useForm({
    defaultValues: {
      nombre: "",
      descripcion: "",
      precio_base: "0",
      imagen_url: "",
      stock: "0",
      categoria_id: "",
      disponible: true,
    },
    onSubmit: ({ value }) => {
      // Convierte los valores al formato esperado por el backend
      onGuardar({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
        precio_base: Number(value.precio_base),
        imagen_url: value.imagen_url.trim() || null,
        stock: Number(value.stock),
        categoria_id: Number(value.categoria_id),
        disponible: value.disponible,
      });
    },
  });

  // Carga los datos al crear o editar un producto
  useEffect(() => {
    if (abierto) {
      form.reset({
        nombre: producto?.nombre ?? "",
        descripcion: producto?.descripcion ?? "",
        precio_base: String(producto?.precio_base ?? 0),
        imagen_url: producto?.imagen_url ?? "",
        stock: String(producto?.stock ?? 0),
        categoria_id: String(producto?.categoria_id ?? ""),
        disponible: producto?.disponible ?? true,
      });
    }
  }, [abierto, producto, form]);

  if (!abierto) {
    return null;
  }

  const inputClass =
    "w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100";

  const labelClass =
    "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-producto-modal"
        className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 dark:text-gray-100"
      >
        <h2
          id="titulo-producto-modal"
          className="mb-5 text-lg font-bold text-gray-800 dark:text-gray-100"
        >
          {producto ? "Editar Producto" : "Añadir Producto"}
        </h2>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          {/* Nombre */}
          <form.Field
            name="nombre"
            validators={{
              onChange: ({ value }) =>
                !value.trim()
                  ? "El nombre es obligatorio"
                  : value.trim().length > 100
                    ? "Máximo 100 caracteres"
                    : undefined,
            }}
          >
            {(field) => (
              <div className="mb-4">
                <label htmlFor={field.name} className={labelClass}>
                  Nombre:
                </label>

                <input
                  id={field.name}
                  type="text"
                  required
                  maxLength={100}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={inputClass}
                />

                {!field.state.meta.isValid && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Descripcion */}
          <form.Field
            name="descripcion"
            validators={{
              onChange: ({ value }) =>
                value.length > 255 ? "Máximo 255 caracteres" : undefined,
            }}
          >
            {(field) => (
              <div className="mb-4">
                <label htmlFor={field.name} className={labelClass}>
                  Descripción:
                </label>

                <textarea
                  id={field.name}
                  maxLength={255}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={inputClass}
                />

                {!field.state.meta.isValid && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Precio */}
          <form.Field
            name="precio_base"
            validators={{
              onChange: ({ value }) =>
                value.trim() === "" ||
                !Number.isFinite(Number(value)) ||
                Number(value) < 0
                  ? "El precio debe ser mayor o igual a 0"
                  : undefined,
            }}
          >
            {(field) => (
              <div className="mb-4">
                <label htmlFor={field.name} className={labelClass}>
                  Precio base:
                </label>

                <input
                  id={field.name}
                  type="number"
                  min="0"
                  step="0.01"
                  required
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={inputClass}
                />

                {!field.state.meta.isValid && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Imagen */}
          <form.Field name="imagen_url">
            {(field) => (
              <div className="mb-4">
                <label htmlFor={field.name} className={labelClass}>
                  URL de imagen (opcional):
                </label>

                <input
                  id={field.name}
                  type="url"
                  placeholder="https://ejemplo.com/imagen.jpg"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={inputClass}
                />
              </div>
            )}
          </form.Field>

          {/* Stock */}
          <form.Field
            name="stock"
            validators={{
              onChange: ({ value }) =>
                value.trim() === "" ||
                !Number.isInteger(Number(value)) ||
                Number(value) < 0
                  ? "El stock debe ser un entero mayor o igual a 0"
                  : undefined,
            }}
          >
            {(field) => (
              <div className="mb-4">
                <label htmlFor={field.name} className={labelClass}>
                  Stock:
                </label>

                <input
                  id={field.name}
                  type="number"
                  min="0"
                  step="1"
                  required
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={inputClass}
                />

                {!field.state.meta.isValid && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Categoria */}
          <form.Field
            name="categoria_id"
            validators={{
              onChange: ({ value }) =>
                !value ? "Debe seleccionar una categoría" : undefined,
            }}
          >
            {(field) => (
              <div className="mb-4">
                <label htmlFor={field.name} className={labelClass}>
                  Categoría:
                </label>

                <select
                  id={field.name}
                  required
                  disabled={isPending || isError}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Seleccionar categoría</option>

                  {categorias.map((categoria) => (
                    <option key={categoria.id} value={categoria.id}>
                      {categoria.nombre}
                    </option>
                  ))}
                </select>

                {isError && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    No se pudieron cargar las categorías.
                  </p>
                )}

                {!field.state.meta.isValid && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Disponibilidad */}
          <form.Field name="disponible">
            {(field) => (
              <div className="mb-6 flex items-center gap-2">
                <input
                  id={field.name}
                  type="checkbox"
                  checked={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.checked)}
                  className="h-4 w-4"
                />

                <label
                  htmlFor={field.name}
                  className="text-sm text-gray-700 dark:text-gray-200"
                >
                  Producto disponible
                </label>
              </div>
            )}
          </form.Field>

          {/* Botones */}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onCerrar}
              className="cursor-pointer rounded-md bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
            >
              Cancelar
            </button>

            <form.Subscribe
              selector={(state) => [state.canSubmit, state.isSubmitting]}
            >
              {([canSubmit, isSubmitting]) => (
                <button
                  type="submit"
                  disabled={!canSubmit || isSubmitting || isPending || isError}
                  className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Guardar
                </button>
              )}
            </form.Subscribe>
          </div>
        </form>
      </div>
    </div>
  );
}
