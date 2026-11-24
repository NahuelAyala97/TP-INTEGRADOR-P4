import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { useAuthStore } from "../store/authStore";
import {
  listarUsuarios,
  cambiarEstadoUsuario,
} from "../services/adminUsuarios";

import type { Usuario } from "../types/auth.types";

const usuariosVacios: Usuario[] = [];

// Gestiona el listado y los cambios de estado de usuarios
export function useAdminUsuarios() {
  const queryClient = useQueryClient();
  const usuarioActualId = useAuthStore((state) => state.usuario?.id);

  const [error, setError] = useState<string | null>(null);

  // Obtiene los usuarios desde el backend
  const {
    data: usuarios = usuariosVacios,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["admin", "usuarios"],
    queryFn: listarUsuarios,
  });

  // Activa o desactiva un usuario
  const cambiarEstadoMutacion = useMutation({
    mutationFn: cambiarEstadoUsuario,

    onSuccess: () => {
      setError(null);

      // Actualiza la lista sin recargar la pagina
      void queryClient.invalidateQueries({
        queryKey: ["admin", "usuarios"],
      });
    },

    onError: (err) => {
      // Obtiene el mensaje de error enviado por FastAPI
      if (isAxiosError<{ detail?: string }>(err)) {
        setError(
          typeof err.response?.data?.detail === "string"
            ? err.response.data.detail
            : "No se pudo modificar el estado del usuario.",
        );
      } else {
        setError("No se pudo modificar el estado del usuario.");
      }
    },
  });

  // Solicita el cambio de estado
  function cambiarEstado(usuario: Usuario) {
    setError(null);

    // Evita que el administrador desactive su propia cuenta
    if (usuario.id === usuarioActualId && !usuario.disabled) {
      setError("No podés desactivar tu propia cuenta.");
      return;
    }

    cambiarEstadoMutacion.mutate(usuario);
  }

  return {
    usuarios,
    isPending,
    isError,
    error,
    usuarioActualId,
    cambiarEstado,
    procesandoId: cambiarEstadoMutacion.isPending
      ? (cambiarEstadoMutacion.variables?.id ?? null)
      : null,
  };
}
