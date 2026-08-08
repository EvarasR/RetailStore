import { getJSON, postForm } from './http';
import type { AdminControlResponse } from '../types/adminControl.types';

export async function fetchAdminControl(modulo: string): Promise<AdminControlResponse> {
  return await getJSON<AdminControlResponse>(`/panel/api/control-empresarial/?modulo=${encodeURIComponent(modulo)}`);
}

export async function runAdminControlAction(values: Record<string, unknown>): Promise<{ mensaje?: string }> {
  return postForm('/panel/api/control-empresarial/acciones/', values);
}
