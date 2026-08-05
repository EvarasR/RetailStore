import { getJSON, postForm } from './http';
import type { OrderSummaryItem, OrderDetailResponse, OrderTrackingResponse } from '../types/order.types';

/**
 * Consulta la lista de pedidos del usuario autenticado vía /api/mis-pedidos/
 */
export async function fetchMyOrders(): Promise<OrderSummaryItem[]> {
  const res = await getJSON<{ ok: boolean; pedidos: OrderSummaryItem[] }>('/api/mis-pedidos/');
  return res.pedidos || [];
}

/**
 * Consulta el detalle fiscal y logístico del pedido vía /api/pedidos/<id>/
 */
export async function fetchOrderDetail(cod_pedido: number | string): Promise<OrderDetailResponse> {
  return getJSON<OrderDetailResponse>(`/api/pedidos/${cod_pedido}/`);
}

/**
 * Consulta el seguimiento y timeline en tiempo real vía /api/pedidos/<id>/tracking/
 */
export async function fetchOrderTracking(cod_pedido: number | string): Promise<OrderTrackingResponse> {
  return getJSON<OrderTrackingResponse>(`/api/pedidos/${cod_pedido}/tracking/`);
}

/**
 * Cancela un pedido si el estado en BD lo permite (/api/pedidos/<id>/cancelar/)
 */
export async function cancelOrder(cod_pedido: number | string, motivo: string): Promise<{ ok: boolean; mensaje: string }> {
  const res = await postForm<{ ok?: boolean; mensaje?: string }>(`/api/pedidos/${cod_pedido}/cancelar/`, {
    motivo,
  });
  return {
    ok: Boolean(res?.ok !== false),
    mensaje: String(res?.mensaje || 'Pedido cancelado.'),
  };
}

/**
 * Solicita una devolución sobre un pedido entregado (/api/pedidos/<id>/devolucion/)
 */
export async function requestOrderReturn(
  cod_pedido: number | string,
  motivo: string,
  descripcion?: string
): Promise<{ ok: boolean; mensaje: string; cod_devolucion?: number }> {
  const res = await postForm<{ ok?: boolean; mensaje?: string; cod_devolucion?: number }>(`/api/pedidos/${cod_pedido}/devolucion/`, {
    motivo,
    descripcion: descripcion || '',
  });
  return {
    ok: Boolean(res?.ok !== false),
    mensaje: String(res?.mensaje || 'Devolución solicitada.'),
    cod_devolucion: res?.cod_devolucion,
  };
}
