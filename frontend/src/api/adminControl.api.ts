import { getJSON } from './http';
import type { AdminControlResponse } from '../types/adminControl.types';

export async function fetchAdminControl(modulo: string): Promise<AdminControlResponse> {
  return await getJSON<AdminControlResponse>(`/panel/api/control-empresarial/?modulo=${encodeURIComponent(modulo)}`);
}
