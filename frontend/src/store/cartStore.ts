import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { Producto } from "@/features/products/types/producto";

// Representa un producto agregado al carrito
export type ItemCarrito = {
  producto_id: number;
  nombre: string;
  precio_unitario: number;
  cantidad: number;
  stock: number;
};

type CartStore = {
  items: ItemCarrito[];
  agregar: (producto: Producto) => void;
  quitar: (producto_id: number) => void;
  cambiarCantidad: (producto_id: number, cantidad: number) => void;
  vaciar: () => void;
  total: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      // Agrega un producto o aumenta su cantidad
      agregar: (producto) => {
        if (!producto.activo || !producto.disponible || producto.stock <= 0) {
          return;
        }

        set((state) => {
          const existente = state.items.find(
            (item) => item.producto_id === producto.id,
          );

          if (existente) {
            return {
              items: state.items.map((item) =>
                item.producto_id === producto.id
                  ? {
                      ...item,
                      // Actualiza el stock conocido del producto
                      stock: producto.stock,
                      cantidad: Math.min(item.cantidad + 1, producto.stock),
                    }
                  : item,
              ),
            };
          }

          return {
            items: [
              ...state.items,
              {
                producto_id: producto.id,
                nombre: producto.nombre,
                precio_unitario: producto.precio_base,
                cantidad: 1,
                stock: producto.stock,
              },
            ],
          };
        });
      },

      // Quita un producto del carrito
      quitar: (producto_id) => {
        set((state) => ({
          items: state.items.filter((item) => item.producto_id !== producto_id),
        }));
      },

      // Modifica la cantidad sin superar el stock conocido
      cambiarCantidad: (producto_id, cantidad) => {
        if (!Number.isInteger(cantidad)) return;

        set((state) => ({
          items:
            cantidad <= 0
              ? state.items.filter((item) => item.producto_id !== producto_id)
              : state.items.map((item) =>
                  item.producto_id === producto_id
                    ? {
                        ...item,
                        cantidad: Math.min(
                          cantidad,
                          item.stock ?? item.cantidad,
                        ),
                      }
                    : item,
                ),
        }));
      },

      // Vacia el carrito despues de confirmar un pedido
      vaciar: () => set({ items: [] }),

      // Calcula el importe total
      total: () =>
        get().items.reduce(
          (total, item) => total + item.precio_unitario * item.cantidad,
          0,
        ),
    }),
    {
      name: "foodstore-carrito",
    },
  ),
);
