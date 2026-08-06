import { getJSON, postForm } from './http';
import type {
  AdminInventoryResponse,
  AdminLotesResponse,
  AdminAlertsResponse,
} from '../types/adminInventory.types';

export async function fetchAdminInventory(): Promise<AdminInventoryResponse> {
  const data = await getJSON<AdminInventoryResponse>('/panel/api/inventario/');
  return data;
}

export async function fetchAdminLotes(): Promise<AdminLotesResponse> {
  const data = await getJSON<AdminLotesResponse>('/panel/api/inventario/lotes/');
  return data;
}

export async function fetchAdminAlerts(): Promise<AdminAlertsResponse> {
  const data = await getJSON<AdminAlertsResponse>('/panel/api/inventario/alertas/');
  return data;
}

export async function executeAdminInventoryAction(
  payload: Record<string, unknown>
): Promise<{ ok: boolean; mensaje?: string; expiradas?: number }> {
  const res = await postForm('/panel/api/inventario/acciones/', payload);
  return res as { ok: boolean; mensaje?: string; expiradas?: number };
}
