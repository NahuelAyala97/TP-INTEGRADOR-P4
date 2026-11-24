import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "@/features/auth";

type ProtectedRouteProps = {
  allowedRoles?: string[];
};

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const usuario = useAuthStore((state) => state.usuario);
  const status = useAuthStore((state) => state.status);

  // Espera mientras se verifica la sesion
  if (status === "checking") {
    return <p className="mt-10 text-center">Verificando sesión...</p>;
  }

  // Redirige al login si no hay un usuario autenticado
  if (status === "unauthenticated" || !usuario) {
    return <Navigate to="/login" replace />;
  }

  // Comprueba si el usuario tiene un rol permitido
  if (allowedRoles && !allowedRoles.includes(usuario.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
}
