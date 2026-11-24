import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/notificationStore";
import { isAxiosError } from "axios";

import type { Producto } from "../types/producto";
import type { ProductoRequest, ProductoFiltros } from "../services/producto";

import {
  actualizarProducto,
  crearProducto,
  eliminarProducto,
  listarProductos,
} from "../services/producto";

const productosVacios: Producto[] = [];

export function useProducts(filtros: ProductoFiltros = {}) {
  const queryClient = useQueryClient();

  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  );

  // Obtiene los productos y sus datos de paginacion
  const {
    data: resultado,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["productos", filtros],
    queryFn: () => listarProductos(filtros),
  });

  // Separa el listado y la cantidad total de productos
  const productos = resultado?.items ?? productosVacios;
  const total = resultado?.total ?? 0;

  // Crea un producto y actualiza el listado
  const crearMutacion = useMutation({
    mutationFn: crearProducto,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
      showNotification("Producto creado correctamente");
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 403) {
        return;
      }

      showNotification(error.message);
    },
  });

  // Actualiza un producto existente
  const actualizarMutacion = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: ProductoRequest }) =>
      actualizarProducto(id, datos),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
      showNotification("Producto actualizado correctamente");
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 403) {
        return;
      }

      showNotification(error.message);
    },
  });

  // Realiza la baja logica y actualiza el listado
  const eliminarMutacion = useMutation({
    mutationFn: eliminarProducto,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
      showNotification("Producto eliminado correctamente");
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 403) {
        return;
      }

      showNotification(error.message);
    },
  });

  return {
    productos,
    total,
    isPending,
    isError,
    crearMutacion,
    actualizarMutacion,
    eliminarMutacion,
  };
}
