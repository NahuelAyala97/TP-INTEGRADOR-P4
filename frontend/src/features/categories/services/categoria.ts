import { api } from "@/shared/api/api";
import type { Categoria } from "../types/categoria";

export type CategoriaRequest = Omit<Categoria, "id">;

// Obtiene todas las categorias activas
export async function listarCategorias(): Promise<Categoria[]> {
  const response = await api.get<Categoria[]>("/api/v1/categorias");
  return response.data;
}

// Obtiene una categoria por id
export async function obtenerCategoria(id: number): Promise<Categoria> {
  const response = await api.get<Categoria>(`/api/v1/categorias/${id}`);
  return response.data;
}

// Crea una nueva categoria
export async function crearCategoria(
  categoria: CategoriaRequest,
): Promise<Categoria> {
  const response = await api.post<Categoria>("/api/v1/categorias", categoria);
  return response.data;
}

// Actualiza una categoria existente
export async function actualizarCategoria(
  id: number,
  categoria: CategoriaRequest,
): Promise<Categoria> {
  const response = await api.put<Categoria>(
    `/api/v1/categorias/${id}`,
    categoria,
  );
  return response.data;
}

// Realiza la baja logica de una categoria
export async function eliminarCategoria(id: number): Promise<void> {
  await api.delete(`/api/v1/categorias/${id}`);
}
