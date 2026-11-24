import { useAuthStore } from "../store/authStore";

export function useAuth() {
  const usuario = useAuthStore((state) => state.usuario);
  const status = useAuthStore((state) => state.status);
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);

  return {
    usuario,
    status,
    login,
    logout,
  };
}
