import { create } from "zustand";
import { persist } from "zustand/middleware";

import { api, setUnauthorizedHandler } from "@/shared/api/api";
import type { Usuario } from "../types/auth.types";

type AuthStatus = "checking" | "authenticated" | "unauthenticated";

type AuthStore = {
  usuario: Usuario | null;
  status: AuthStatus;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      usuario: null,
      status: "checking",

      // Inicia sesion y obtiene los datos del usuario
      login: async (username, password) => {
        const datos = new URLSearchParams({
          username,
          password,
        });

        await api.post("/api/v1/auth/token", datos);

        const { data } = await api.get<Usuario>("/api/v1/auth/me");

        set({ usuario: data, status: "authenticated" });
      },

      // Cierra la sesion y limpia el usuario guardado
      logout: async () => {
        try {
          await api.post("/api/v1/auth/logout");
        } finally {
          set({ usuario: null, status: "unauthenticated" });
        }
      },

      // Verifica que la sesion siga siendo valida
      checkAuth: async () => {
        set({ status: "checking" });

        try {
          const { data } = await api.get<Usuario>("/api/v1/auth/me");

          set({ usuario: data, status: "authenticated" });
        } catch {
          set({ usuario: null, status: "unauthenticated" });
        }
      },
    }),
    {
      name: "foodstore-auth",

      // Guarda solamente los datos publicos del usuario
      partialize: (state) => ({
        usuario: state.usuario,
      }),
    },
  ),
);

// Limpia la sesion cuando Axios recibe una respuesta 401
setUnauthorizedHandler(() => {
  useAuthStore.setState({
    usuario: null,
    status: "unauthenticated",
  });
});
