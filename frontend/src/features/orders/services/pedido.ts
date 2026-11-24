import { api } from "@/shared/api/api";

import type {
  EstadoPedido,
  Pedido,
  PedidoCreate,
  PedidosPaginados,
  ResumenPedidos,
} from "../types/pedido";

// Filtros opcionales para consultar pedidos
export type PedidoFiltros = {
  skip?: number;
  limit?: number;
  estado?: EstadoPedido;
};

// Crea un pedido con los productos del carrito
export async function crearPedido(datos: PedidoCreate): Promise<Pedido> {
  const response = await api.post<Pedido>("/api/v1/pedidos", datos);
  return response.data;
}

// Lista los pedidos del usuario o todos si es administrador
export async function listarPedidos(
  filtros: PedidoFiltros = {},
): Promise<PedidosPaginados> {
  const response = await api.get<PedidosPaginados>("/api/v1/pedidos", {
    params: filtros,
  });

  return response.data;
}

// Obtiene el detalle de un pedido por su id
export async function obtenerPedido(id: number): Promise<Pedido> {
  const response = await api.get<Pedido>(`/api/v1/pedidos/${id}`);
  return response.data;
}

// Permite al administrador modificar el estado de un pedido
export async function cambiarEstadoPedido(
  id: number,
  estado: EstadoPedido,
): Promise<Pedido> {
  const response = await api.patch<Pedido>(`/api/v1/pedidos/${id}/estado`, {
    estado,
  });

  return response.data;
}

// Permite al cliente cancelar un pedido pendiente
export async function cancelarPedido(id: number): Promise<Pedido> {
  const response = await api.patch<Pedido>(`/api/v1/pedidos/${id}/cancelar`);

  return response.data;
}

// Obtiene los indicadores del panel de administracion
export async function obtenerResumenPedidos(): Promise<ResumenPedidos> {
  const response = await api.get<ResumenPedidos>("/api/v1/pedidos/resumen");

  return response.data;
}
