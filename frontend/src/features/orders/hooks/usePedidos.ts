import { useState } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { isAxiosError } from "axios";

import { useAuthStore } from "@/features/auth";
import { useCartStore } from "@/store/cartStore";

import {
  crearPedido,
  listarPedidos,
  cancelarPedido,
  cambiarEstadoPedido,
  obtenerResumenPedidos,
} from "../services/pedido";
import type { FormaPago, EstadoPedido } from "../types/pedido";

// Datos que completa el usuario en el checkout
type DatosCheckout = {
  direccion_entrega: string;
  forma_pago: FormaPago;
  notas: string;
};

// Gestiona la creacion del pedido
export function useCrearPedido() {
  const queryClient = useQueryClient();

  const items = useCartStore((state) => state.items);
  const vaciar = useCartStore((state) => state.vaciar);

  return useMutation({
    mutationFn: (datos: DatosCheckout) =>
      crearPedido({
        // Envia solamente el id y la cantidad de cada producto
        items: items.map((item) => ({
          producto_id: item.producto_id,
          cantidad: item.cantidad,
        })),
        direccion_entrega: datos.direccion_entrega.trim(),
        forma_pago: datos.forma_pago,
        notas: datos.notas.trim() || null,
      }),

    onSuccess: () => {
      // Vacia el carrito solo si el pedido se creo correctamente
      vaciar();

      // Actualiza las consultas relacionadas
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
      void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
    },
  });
}

// Maneja los datos y el formulario del checkout
export function useCheckout() {
  const items = useCartStore((state) => state.items);
  const rol = useAuthStore((state) => state.usuario?.role);

  const [error, setError] = useState<string | null>(null);
  const [pedidoCreado, setPedidoCreado] = useState<number | null>(null);

  const crearMutacion = useCrearPedido();

  // Calcula el total estimado del carrito
  const total = items.reduce(
    (acumulado, item) => acumulado + item.precio_unitario * item.cantidad,
    0,
  );

  // Configura el formulario y su envio
  const form = useForm({
    defaultValues: {
      direccion_entrega: "",
      forma_pago: "EFECTIVO" as FormaPago,
      notas: "",
    },

    onSubmit: async ({ value }) => {
      setError(null);

      try {
        const pedido = await crearMutacion.mutateAsync(value);

        // Guarda el id para redirigir despues de la compra
        setPedidoCreado(pedido.id);
      } catch (err) {
        // Obtiene el mensaje de error enviado por FastAPI
        if (isAxiosError<{ detail?: string }>(err)) {
          setError(
            typeof err.response?.data?.detail === "string"
              ? err.response.data.detail
              : "No se pudo crear el pedido. Revisá el stock disponible.",
          );
        } else {
          setError("No se pudo crear el pedido.");
        }
      }
    },
  });

  return {
    items,
    total,
    rol,
    error,
    pedidoCreado,
    form,
  };
}

const LIMITE = 10;

// Gestiona el listado y la cancelacion de pedidos del cliente
export function useMisPedidos() {
  const [pagina, setPagina] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Consulta los pedidos del usuario autenticado
  const { data, isPending, isError } = useQuery({
    queryKey: ["pedidos", "mis-pedidos", pagina],
    queryFn: () =>
      listarPedidos({
        skip: pagina * LIMITE,
        limit: LIMITE,
      }),
  });

  // Cancela un pedido pendiente
  const cancelarMutacion = useMutation({
    mutationFn: cancelarPedido,

    onSuccess: () => {
      setError(null);

      // Actualiza los pedidos y el stock disponible
      void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
    },

    onError: (err) => {
      // Obtiene el mensaje de error enviado por FastAPI
      if (isAxiosError<{ detail?: string }>(err)) {
        setError(
          typeof err.response?.data?.detail === "string"
            ? err.response.data.detail
            : "No se pudo cancelar el pedido.",
        );
      } else {
        setError("No se pudo cancelar el pedido.");
      }
    },
  });

  // Solicita confirmacion antes de cancelar
  function confirmarCancelacion(id: number) {
    if (window.confirm(`¿Deseás cancelar el pedido #${id}?`)) {
      setError(null);
      cancelarMutacion.mutate(id);
    }
  }

  // Prepara los datos para mostrar en la pagina
  const pedidos = data?.items ?? [];
  const totalPaginas = Math.max(1, Math.ceil((data?.total ?? 0) / LIMITE));

  return {
    pagina,
    setPagina,
    pedidos,
    totalPaginas,
    error,
    isPending,
    isError,
    cancelando: cancelarMutacion.isPending,
    cancelandoId: cancelarMutacion.isPending
      ? cancelarMutacion.variables
      : null,
    confirmarCancelacion,
  };
}

// Obtiene los indicadores del resumen administrativo
export function useResumenPedidos() {
  const {
    data: resumen,
    isPending: cargandoResumen,
    isError: errorResumen,
  } = useQuery({
    queryKey: ["resumen-pedidos"],
    queryFn: obtenerResumenPedidos,
  });

  return {
    resumen,
    cargandoResumen,
    errorResumen,
  };
}

// Gestiona los pedidos y el resumen del administrador
export function useAdminPedidos() {
  const [pagina, setPagina] = useState(0);
  const [filtroEstado, setFiltroEstado] = useState<EstadoPedido | "">("");
  const [error, setError] = useState<string | null>(null);

  const queryClient = useQueryClient();

  // Obtiene todos los pedidos con filtros y paginacion
  const { data, isPending, isError } = useQuery({
    queryKey: ["pedidos", "admin", pagina, filtroEstado],
    queryFn: () =>
      listarPedidos({
        skip: pagina * LIMITE,
        limit: LIMITE,
        estado: filtroEstado || undefined,
      }),
  });

  // Obtiene los indicadores administrativos
  const { resumen, cargandoResumen, errorResumen } = useResumenPedidos();

  // Actualiza el estado de un pedido
  const cambiarEstadoMutacion = useMutation({
    mutationFn: ({ id, estado }: { id: number; estado: EstadoPedido }) =>
      cambiarEstadoPedido(id, estado),

    onSuccess: () => {
      setError(null);

      // Actualiza los pedidos, el resumen y los productos
      void queryClient.invalidateQueries({ queryKey: ["pedidos"] });
      void queryClient.invalidateQueries({ queryKey: ["resumen-pedidos"] });
      void queryClient.invalidateQueries({ queryKey: ["productos"] });
    },

    onError: (err) => {
      // Muestra el error enviado por FastAPI
      if (isAxiosError<{ detail?: string }>(err)) {
        setError(
          typeof err.response?.data?.detail === "string"
            ? err.response.data.detail
            : "No se pudo cambiar el estado del pedido.",
        );
      } else {
        setError("No se pudo cambiar el estado del pedido.");
      }
    },
  });

  // Cambia el filtro y vuelve a la primera pagina
  function cambiarFiltroEstado(estado: EstadoPedido | "") {
    setFiltroEstado(estado);
    setPagina(0);
  }

  // Solicita el cambio de estado al backend
  function cambiarEstado(id: number, estado: EstadoPedido) {
    setError(null);
    cambiarEstadoMutacion.mutate({ id, estado });
  }

  // Prepara los datos para mostrar en la pagina
  const pedidos = data?.items ?? [];
  const totalPaginas = Math.max(1, Math.ceil((data?.total ?? 0) / LIMITE));

  return {
    pagina,
    setPagina,
    filtroEstado,
    cambiarFiltroEstado,
    pedidos,
    totalPaginas,
    resumen,
    cargandoResumen,
    errorResumen,
    error,
    isPending,
    isError,
    cambiandoEstado: cambiarEstadoMutacion.isPending,
    cambiarEstado,
  };
}
