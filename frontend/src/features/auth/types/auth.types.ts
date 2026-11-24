// Datos públicos del usuario que devuelve el backend
export type Usuario = {
  id: number;
  username: string;
  full_name: string;
  email: string;
  role: "admin" | "user";
  disabled: boolean;
  created_at: string;
};
