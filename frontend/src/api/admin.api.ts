import { getJSON } from './http';
import type { AdminSummaryResponse } from '../types/admin.types';

/**
 * Obtiene el resumen ejecutivo del panel administrativo en Django / PostgreSQL
 */
export async function fetchAdminSummary(): Promise<AdminSummaryResponse> {
  const data = await getJSON<AdminSummaryResponse>('/panel/api/resumen/');
  return data;
}
