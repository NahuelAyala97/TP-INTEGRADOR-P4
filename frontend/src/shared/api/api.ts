import axios, { type AxiosError } from "axios";

// Instancia de Axios para comunicarse con el backend
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Funcion que se ejecuta cuando la sesion deja de ser valida
let onUnauthorized: (() => void) | null = null;

// Permite registrar el manejo de sesiones vencidas
export function setUnauthorizedHandler(handler: () => void) {
  onUnauthorized = handler;
}

// Interceptor para manejar sesiones invalidas
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError<{ detail?: string }>) => {
    const status = error.response?.status;
    const ruta = error.config?.url?.split("?")[0] ?? "";
    const detalle = error.response?.data?.detail;

    // No aplica el manejo global al login ni a la verificacion de sesion
    const esRutaAuth =
      ruta.endsWith("/auth/token") || ruta.endsWith("/auth/me");

    const sesionVencida = status === 401 && !esRutaAuth;

    // Detecta cuando el backend desactiva una cuenta
    const cuentaDesactivada =
      status === 400 && detalle === "Cuenta de usuario desactivada";

    if (sesionVencida || cuentaDesactivada) {
      onUnauthorized?.();
    }

    return Promise.reject(error);
  },
);
