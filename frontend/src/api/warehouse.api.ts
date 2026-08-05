import { getJSON, postForm } from './http';
import type {
  WarehouseProductItem,
  WarehouseLotItem,
  WarehouseAlertItem,
  WarehouseOrderItem,
} from '../types/warehouse.types';

export interface WarehouseInventoryResponse {
  ok: boolean;
  productos: WarehouseProductItem[];
  resumen?: {
    total_skus: number;
    en_alerta: number;
    stock_critico: number;
  };
}

export interface WarehouseLotsResponse {
  ok: boolean;
  lotes: WarehouseLotItem[];
}

export interface WarehouseAlertsResponse {
  ok: boolean;
  alertas: WarehouseAlertItem[];
}

export interface WarehouseOrdersResponse {
  ok: boolean;
  pedidos: WarehouseOrderItem[];
}

export interface WarehouseOrderDetailResponse {
  ok: boolean;
  pedido: {
    cod_pedido: number;
    numero_pedido: string;
    estado: string;
    cliente: string;
    total: string;
    direccion?: string;
    factura?: string | null;
  };
  detalles: Array<{
    producto: string;
    cantidad: number;
    precio_final: string;
    subtotal: string;
  }>;
  lotes: Array<{
    producto: string;
    lote: string;
    cantidad: number;
    pvp_historico: string;
    subtotal: string;
  }>;
}

export async function fetchWarehouseInventory(): Promise<WarehouseInventoryResponse> {
  const data = await getJSON<WarehouseInventoryResponse>('/panel/api/inventario/');
  return data;
}

export async function fetchWarehouseLots(): Promise<WarehouseLotsResponse> {
  const data = await getJSON<WarehouseLotsResponse>('/panel/api/inventario/lotes/');
  return data;
}

export async function fetchWarehouseAlerts(): Promise<WarehouseAlertsResponse> {
  const data = await getJSON<WarehouseAlertsResponse>('/panel/api/inventario/alertas/');
  return data;
}

export async function executeWarehouseAction(
  accion: string,
  cod_producto?: number,
  cantidad?: number,
  cod_almacen?: number
): Promise<{ ok: boolean; mensaje?: string }> {
  const payload: Record<string, string> = { accion };
  if (cod_producto !== undefined) payload.cod_producto = String(cod_producto);
  if (cantidad !== undefined) payload.cantidad = String(cantidad);
  if (cod_almacen !== undefined) payload.cod_almacen = String(cod_almacen);

  const res = await postForm('/panel/api/inventario/acciones/', payload);
  return res as { ok: boolean; mensaje?: string };
}

export async function resolveWarehouseAlert(
  cod_alerta: number,
  observacion?: string
): Promise<{ ok: boolean; mensaje?: string }> {
  const res = await postForm('/panel/api/inventario/acciones/', {
    accion: 'resolver_alerta',
    cod_alerta: String(cod_alerta),
    observacion: observacion || 'Alerta resuelta desde panel operativo de almacén',
  });
  return res as { ok: boolean; mensaje?: string };
}

export async function fetchWarehouseOrders(): Promise<WarehouseOrdersResponse> {
  const data = await getJSON<WarehouseOrdersResponse>('/panel/api/pedidos/');
  return data;
}

export async function fetchWarehouseOrderDetail(
  cod_pedido: number
): Promise<WarehouseOrderDetailResponse> {
  const data = await getJSON<WarehouseOrderDetailResponse>(
    `/panel/api/pedidos/${cod_pedido}/detalle/`
  );
  return data;
}

export async function changeWarehouseOrderState(
  cod_pedido: number,
  estado: string,
  comentario?: string
): Promise<{ ok: boolean; mensaje?: string }> {
  const res = await postForm(`/panel/api/pedidos/${cod_pedido}/estado/`, {
    estado,
    comentario: comentario || 'Cambio de estado desde panel operativo de almacén',
  });
  return res as { ok: boolean; mensaje?: string };
}
