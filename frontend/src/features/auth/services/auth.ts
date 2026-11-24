import { api } from "@/shared/api/api";

// Datos necesarios para registrar un usuario
type RegistroRequest = {
  username: string;
  full_name: string;
  email: string;
  password: string;
};

// Envia los datos del nuevo usuario al backend
export async function registrarUsuario(datos: RegistroRequest): Promise<void> {
  await api.post("/api/v1/auth/register", datos);
}
