import type { Categoria } from "@/features/categories/types/categoria";

// Datos de un producto que devuelve el backend
export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  precio_base: number;
  imagen_url: string | null;
  stock: number;
  disponible: boolean;
  activo: boolean;
  categoria_id: number;
  categoria: Categoria;
}

// Respuesta paginada del listado de productos
export interface ProductosPaginados {
  total: number;
  items: Producto[];
}
