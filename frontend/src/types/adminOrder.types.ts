export interface AdminOrderStatusOption {
  cod_estado_pedido: string;
  nombre: string;
}

export interface AdminOrderItem {
  cod_pedido: number;
  numero_pedido: string;
  cliente: string;
  email: string;
  estado: string;
  estado_nombre: string;
  total: string;
  fecha?: string | null;
  requiere_abastecimiento?: boolean;
}

export interface AdminOrdersResponse {
  ok: boolean;
  estados: AdminOrderStatusOption[];
  pedidos: AdminOrderItem[];
}

export interface AdminOrderDetailInfo {
  cod_pedido: number;
  numero_pedido: string;
  estado: string;
  cliente: string;
  total: string;
  direccion: string;
  factura?: string | null;
}

export interface AdminOrderDetailLine {
  producto: string;
  cantidad: number;
  precio_final: string;
  subtotal: string;
}

export interface AdminOrderLoteLine {
  producto: string;
  lote: string;
  cantidad: number;
  pvp_historico: string;
  subtotal: string;
}

export interface AdminOrderDetailResponse {
  ok: boolean;
  pedido: AdminOrderDetailInfo;
  detalles: AdminOrderDetailLine[];
  lotes: AdminOrderLoteLine[];
}
