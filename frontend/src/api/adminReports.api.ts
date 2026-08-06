import { getJSON } from './http';
import type { AdminReportsResponse } from '../types/adminReport.types';

export async function fetchAdminReports(): Promise<AdminReportsResponse> {
  return await getJSON<AdminReportsResponse>('/panel/api/reportes/ventas/');
}
