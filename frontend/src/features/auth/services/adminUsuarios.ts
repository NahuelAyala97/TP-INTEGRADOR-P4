import { api } from "@/shared/api/api";
import type { Usuario } from "../types/auth.types";

// Obtiene todos los usuarios registrados
export async function listarUsuarios(): Promise<Usuario[]> {
  const response = await api.get<Usuario[]>("/api/v1/admin/usuarios");

  return response.data;
}

// Activa o desactiva un usuario segun su estado actual
export async function cambiarEstadoUsuario(usuario: Usuario): Promise<void> {
  const accion = usuario.disabled ? "activar" : "desactivar";

  await api.post(`/api/v1/admin/usuarios/${usuario.id}/${accion}`);
}
