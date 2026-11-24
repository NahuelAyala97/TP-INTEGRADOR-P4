import { api } from "@/shared/api/api";

import type { Producto, ProductosPaginados } from "../types/producto";

// Datos necesarios para crear o actualizar un producto
export type ProductoRequest = Pick<
  Producto,
  | "nombre"
  | "descripcion"
  | "precio_base"
  | "imagen_url"
  | "stock"
  | "disponible"
  | "categoria_id"
>;

// Datos para actualizar el stock
export type ProductoStockUpdate = Pick<Producto, "stock" | "disponible">;

// Filtros opcionales del listado
export type ProductoFiltros = {
  skip?: number;
  limit?: number;
  search?: string;
  categoria_id?: number;
  disponible?: boolean;
};

// Obtiene los productos con paginacion y filtros
export async function listarProductos(
  filtros: ProductoFiltros = {},
): Promise<ProductosPaginados> {
  const response = await api.get<ProductosPaginados>("/api/v1/productos", {
    params: filtros,
  });

  return response.data;
}

// Obtiene un producto por su id
export async function obtenerProducto(id: number): Promise<Producto> {
  const response = await api.get<Producto>(`/api/v1/productos/${id}`);
  return response.data;
}

// Crea un nuevo producto
export async function crearProducto(
  producto: ProductoRequest,
): Promise<Producto> {
  const response = await api.post<Producto>("/api/v1/productos", producto);

  return response.data;
}

// Actualiza un producto existente
export async function actualizarProducto(
  id: number,
  producto: ProductoRequest,
): Promise<Producto> {
  const response = await api.put<Producto>(`/api/v1/productos/${id}`, producto);

  return response.data;
}

// Actualiza el stock y la disponibilidad
export async function actualizarStock(
  id: number,
  datos: ProductoStockUpdate,
): Promise<Producto> {
  const response = await api.patch<Producto>(
    `/api/v1/productos/${id}/stock`,
    datos,
  );

  return response.data;
}

// Realiza la baja logica de un producto
export async function eliminarProducto(id: number): Promise<void> {
  await api.delete(`/api/v1/productos/${id}`);
}
