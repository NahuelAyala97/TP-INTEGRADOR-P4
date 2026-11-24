import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { isAxiosError } from "axios";
import { useNavigate } from "react-router-dom";

import { registrarUsuario } from "../services/auth";

export default function RegisterPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  // Configura el formulario de registro
  const form = useForm({
    defaultValues: {
      username: "",
      full_name: "",
      email: "",
      password: "",
    },
    onSubmit: async ({ value }) => {
      setError(null);

      try {
        // Envia los datos requeridos por Food Store
        await registrarUsuario({
          username: value.username.trim(),
          full_name: value.full_name.trim(),
          email: value.email.trim(),
          password: value.password,
        });

        navigate("/login", { replace: true });
      } catch (err) {
        if (isAxiosError<{ detail?: string }>(err)) {
          setError(
            typeof err.response?.data?.detail === "string"
              ? err.response.data.detail
              : "No se pudo registrar el usuario",
          );
        } else {
          setError("No se pudo registrar el usuario");
        }
      }
    },
  });

  return (
    /* Fondo y formulario adaptables al modo oscuro */
    <main className="min-h-[calc(100vh-72px)] bg-gray-50 px-4 py-12 dark:bg-gray-950">
      <div className="mx-auto max-w-md rounded-lg bg-white p-6 text-gray-900 shadow-md dark:bg-gray-900 dark:text-gray-100">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-800 dark:text-gray-100">
          Crear cuenta
        </h1>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void form.handleSubmit();
          }}
        >
          {/* Nombre de usuario */}
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
                  type="text"
                  required
                  autoComplete="username"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
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

          {/* Nombre completo */}
          <form.Field
            name="full_name"
            validators={{
              onChange: ({ value }) =>
                value.trim() ? undefined : "El nombre completo es obligatorio",
            }}
          >
            {(field) => (
              <div className="mb-4">
                <label
                  htmlFor={field.name}
                  className="mb-2 block font-medium text-gray-700 dark:text-gray-200"
                >
                  Nombre completo:
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="text"
                  required
                  autoComplete="name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
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

          {/* Correo electronico */}
          <form.Field
            name="email"
            validators={{
              onChange: ({ value }) =>
                value.trim() ? undefined : "El email es obligatorio",
            }}
          >
            {(field) => (
              <div className="mb-4">
                <label
                  htmlFor={field.name}
                  className="mb-2 block font-medium text-gray-700 dark:text-gray-200"
                >
                  Email:
                </label>
                <input
                  id={field.name}
                  name={field.name}
                  type="email"
                  required
                  autoComplete="email"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
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

          {/* Contraseña de al menos 8 caracteres */}
          <form.Field
            name="password"
            validators={{
              onChange: ({ value }) =>
                value.length >= 8
                  ? undefined
                  : "La contraseña debe tener al menos 8 caracteres",
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
                  minLength={8}
                  autoComplete="new-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
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

          {error && (
            <p
              role="alert"
              className="mb-4 text-sm text-red-600 dark:text-red-400"
            >
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
                {isSubmitting ? "Registrando..." : "Registrarse"}
              </button>
            )}
          </form.Subscribe>
        </form>
      </div>
    </main>
  );
}
