import { getJSON, postForm } from './http';
import type { AdminTrackingResponse } from '../types/adminTracking.types';

export async function fetchAdminTracking(): Promise<AdminTrackingResponse> {
  return await getJSON<AdminTrackingResponse>('/panel/api/tracking/');
}

export async function processPendingTracking(): Promise<{ ok: boolean; procesados?: number; mensaje?: string }> {
  const res = await postForm('/panel/api/tracking/acciones/', { accion: 'procesar' });
  return res as { ok: boolean; procesados?: number; mensaje?: string };
}
