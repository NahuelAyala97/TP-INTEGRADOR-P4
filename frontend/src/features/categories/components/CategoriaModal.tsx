import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";

import type { Categoria } from "../types/categoria";
import type { CategoriaRequest } from "../services/categoria";

interface CategoriaModalProps {
  abierto: boolean;
  categoria: Categoria | null;
  onCerrar: () => void;
  onGuardar: (datos: CategoriaRequest) => void;
  error?: string | null;
}

export default function CategoriaModal({
  abierto,
  categoria,
  onCerrar,
  onGuardar,
  error,
}: CategoriaModalProps) {
  // Configura el formulario
  const form = useForm({
    defaultValues: {
      nombre: "",
      descripcion: "",
    },
    onSubmit: ({ value }) => {
      onGuardar({
        nombre: value.nombre.trim(),
        descripcion: value.descripcion.trim(),
      });
    },
  });

  // Carga los datos al crear o editar
  useEffect(() => {
    if (abierto) {
      form.reset({
        nombre: categoria?.nombre ?? "",
        descripcion: categoria?.descripcion ?? "",
      });
    }
  }, [abierto, categoria, form]);

  if (!abierto) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-modal"
        className="w-full max-w-sm rounded-lg bg-white p-6 shadow-xl dark:bg-gray-800 dark:text-gray-100"
      >
        <h2
          id="titulo-modal"
          className="mb-5 text-lg font-bold text-gray-800 dark:text-gray-100"
        >
          {categoria ? "Editar Categoría" : "Añadir Categoría"}
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
                value.trim() ? undefined : "El nombre es obligatorio",
            }}
          >
            {(field) => (
              <div className="mb-4">
                <label
                  htmlFor={field.name}
                  className="mb-2 block font-semibold text-gray-700 dark:text-gray-200"
                >
                  Nombre de la categoría:
                </label>

                <input
                  type="text"
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                />

                {field.state.meta.isTouched && !field.state.meta.isValid && (
                  <p role="alert" className="mt-1 text-sm text-red-600">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Descripcion */}
          <form.Field name="descripcion">
            {(field) => (
              <div className="mb-6">
                <label
                  htmlFor={field.name}
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-200"
                >
                  Descripción:
                </label>

                <textarea
                  id={field.name}
                  name={field.name}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100 dark:placeholder-gray-400"
                />
              </div>
            )}
          </form.Field>

          {/* Error del backend */}
          {error && (
            <p role="alert" className="mb-4 text-sm text-red-600">
              {error}
            </p>
          )}

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
                  disabled={!canSubmit || isSubmitting}
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
