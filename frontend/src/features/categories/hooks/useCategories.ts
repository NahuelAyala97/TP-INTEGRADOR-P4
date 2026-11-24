import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNotificationStore } from "@/store/notificationStore";
import { isAxiosError } from "axios";

import type { Categoria } from "../types/categoria";
import type { CategoriaRequest } from "../services/categoria";

import {
  actualizarCategoria,
  crearCategoria,
  eliminarCategoria,
  listarCategorias,
} from "../services/categoria";

const categoriasVacias: Categoria[] = [];

export function useCategories() {
  const queryClient = useQueryClient();

  const showNotification = useNotificationStore(
    (state) => state.showNotification,
  );

  const {
    data: categorias = categoriasVacias,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["categorias"],
    queryFn: listarCategorias,
  });

  const crearMutacion = useMutation({
    mutationFn: crearCategoria,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categorias"] });
      showNotification("Categoría creada correctamente");
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 403) {
        return;
      }

      showNotification(error.message);
    },
  });

  const actualizarMutacion = useMutation({
    mutationFn: ({ id, datos }: { id: number; datos: CategoriaRequest }) =>
      actualizarCategoria(id, datos),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categorias"] });
      showNotification("Categoría actualizada correctamente");
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 403) {
        return;
      }

      showNotification(error.message);
    },
  });

  const eliminarMutacion = useMutation({
    mutationFn: eliminarCategoria,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["categorias"] });
      showNotification("Categoría eliminada correctamente");
    },
    onError: (error) => {
      if (isAxiosError(error) && error.response?.status === 403) {
        return;
      }

      showNotification(error.message);
    },
  });

  return {
    categorias,
    isPending,
    isError,
    crearMutacion,
    actualizarMutacion,
    eliminarMutacion,
  };
}
