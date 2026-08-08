/**
 * Tipos oficiales de Pedidos y Tracking para TechTail Enterprise (DB-First)
 */

export interface OrderSummaryItem {
  cod_pedido: number;
  numero_pedido: string;
  estado: string;
  estado_nombre: string;
  total: string;
  fecha: string;
  requiere_abastecimiento: boolean;
  puede_cancelar: boolean;
  puede_devolver: boolean;
}

export interface OrderItemDetail {
  producto: string;
  cantidad: number;
  precio_unitario: string;
  subtotal: string;
}

export interface OrderDetailData {
  cod_pedido: number;
  numero_pedido: string;
  estado: string;
  total: string;
  subtotal: string;
  descuento: string;
  impuesto: string;
  costo_envio: string;
}

export interface OrderDetailResponse {
  ok: boolean;
  pedido: OrderDetailData;
  items: OrderItemDetail[];
  factura?: {
    cod_factura: number;
    numero_factura: string;
    estado: string;
    pdf_url: string;
  } | null;
}

export interface TrackingEnvioData {
  numero_tracking?: string | null;
  estado: string;
  fecha_estimada_entrega?: string | null;
  fecha_entrega?: string | null;
  progreso: number;
}

export interface TrackingEventItem {
  cod_tracking_evento: number;
  tipo: string;
  nombre: string;
  descripcion: string;
  ubicacion?: string | null;
  visible_cliente: boolean;
  fecha: string;
  orden: number;
  origen?: string;
  completado: boolean;
}

export interface OrderTrackingResponse {
  ok: boolean;
  envio: TrackingEnvioData;
  eventos: TrackingEventItem[];
}
