import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Configura el formulario de inicio de sesión
  const form = useForm({
    defaultValues: {
      username: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setError(null);

      try {
        await login(value.username.trim(), value.password);
        navigate("/categorias", { replace: true });
      } catch (err) {
        if (isAxiosError<{ detail?: string }>(err)) {
          setError(err.response?.data?.detail ?? "No se pudo iniciar sesión");
        } else {
          setError("No se pudo iniciar sesión");
        }
      }
    },
  });

  return (
    /* Fondo de la pagina adaptable al tema */
    <main className="min-h-[calc(100vh-72px)] bg-gray-50 px-4 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-md rounded-lg bg-white p-6 text-gray-900 shadow-md dark:bg-gray-900 dark:text-gray-100">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-gray-100">
          Iniciar sesión
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          {/* username */}
          <form.Field
            name="username"
            validators={{
              onChange: ({ value }) =>
                value.trim() ? undefined : "El usuario es obligatorio",
            }}
          >
            {(field) => (
              <div className="mb-4">
                <label
                  htmlFor={field.name}
                  className="mb-2 block font-medium text-gray-700 dark:text-gray-200"
                >
                  Usuario:
                </label>

                <input
                  id={field.name}
                  name={field.name}
                  type="username"
                  required
                  autoComplete="username"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />

                {field.state.meta.isTouched && !field.state.meta.isValid && (
                  <p
                    role="alert"
                    className="mb-4 text-sm text-red-600 dark:text-red-400"
                  >
                    {error}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Contraseña */}
          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                value ? undefined : "La contraseña es obligatoria",
            }}
          >
            {(field) => (
              <div className="mb-5">
                <label
                  htmlFor={field.name}
                  className="mb-2 block font-medium text-gray-700 dark:text-gray-200"
                >
                  Contraseña:
                </label>

                <input
                  id={field.name}
                  name={field.name}
                  type="password"
                  required
                  autoComplete="current-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />

                {field.state.meta.isTouched && !field.state.meta.isValid && (
                  <p className="mt-1 text-sm text-red-600">
                    {field.state.meta.errors.join(", ")}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Error del backend */}
          {error && (
            <p role="alert" className="mb-4 text-sm text-red-600">
              {error}
            </p>
          )}

          <form.Subscribe
            selector={(state) => [state.canSubmit, state.isSubmitting]}
          >
            {([canSubmit, isSubmitting]) => (
              <button
                type="submit"
                disabled={!canSubmit || isSubmitting}
                className="w-full cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Ingresando..." : "Ingresar"}
              </button>
            )}
          </form.Subscribe>
        </form>
      </div>
    </main>
  );
}
