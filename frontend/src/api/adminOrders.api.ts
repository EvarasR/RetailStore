import { getJSON, postForm } from './http';
import type { AdminOrdersResponse, AdminOrderDetailResponse } from '../types/adminOrder.types';

/**
 * Consulta la lista oficial de pedidos con estados en BD
 */
export async function fetchAdminOrders(estado = ''): Promise<AdminOrdersResponse> {
  const queryStr = estado ? `?estado=${encodeURIComponent(estado)}` : '';
  const data = await getJSON<AdminOrdersResponse>(`/panel/api/pedidos/${queryStr}`);
  return data;
}

/**
 * Consulta el detalle integral corporativo y líneas del pedido
 */
export async function fetchAdminOrderDetail(cod_pedido: number | string): Promise<AdminOrderDetailResponse> {
  const data = await getJSON<AdminOrderDetailResponse>(`/panel/api/pedidos/${cod_pedido}/detalle/`);
  return data;
}

/**
 * Actualiza el estado oficial de un pedido en BD (/panel/api/pedidos/<id>/estado/)
 */
export async function changeAdminOrderStatus(
  cod_pedido: number | string,
  estado: string,
  comentario = 'Cambio de estado desde Panel React'
): Promise<{ ok: boolean; mensaje: string }> {
  const res = await postForm(`/panel/api/pedidos/${cod_pedido}/estado/`, {
    estado,
    comentario,
  });
  return res as { ok: boolean; mensaje: string };
}
