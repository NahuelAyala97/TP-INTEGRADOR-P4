// Estados posibles de un pedido
export type EstadoPedido =
  | "PENDIENTE"
  | "EN_PREPARACION"
  | "ENTREGADO"
  | "CANCELADO";

// Formas de pago permitidas
export type FormaPago = "EFECTIVO" | "TRANSFERENCIA";

// Producto enviado al crear un pedido
export type ItemPedidoCreate = {
  producto_id: number;
  cantidad: number;
};

// Datos que envia el checkout al backend
export type PedidoCreate = {
  items: ItemPedidoCreate[];
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas?: string | null;
};

// Detalle del producto guardado en el pedido
export type DetallePedido = {
  producto_id: number;
  nombre_producto: string;
  precio_unitario: number;
  cantidad: number;
  subtotal: number;
};

// Pedido devuelto por el backend
export type Pedido = {
  id: number;
  usuario_id: number;
  estado: EstadoPedido;
  forma_pago: FormaPago;
  direccion_entrega: string;
  notas: string | null;
  total: number;
  created_at: string;
  updated_at: string;
  items: DetallePedido[];
};

// Respuesta paginada del listado de pedidos
export type PedidosPaginados = {
  total: number;
  items: Pedido[];
};

// Indicadores del panel de administracion
export type ResumenPedidos = {
  pendientes: number;
  en_preparacion: number;
  entregados: number;
  cancelados: number;
  pedidos_hoy: number;
  ingresos_entregados: number;
};
