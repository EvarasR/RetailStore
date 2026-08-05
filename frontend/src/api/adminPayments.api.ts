import { getJSON } from './http';
import type { AdminPaymentsResponse } from '../types/adminPayment.types';

export async function fetchAdminPayments(): Promise<AdminPaymentsResponse> {
  return await getJSON<AdminPaymentsResponse>('/panel/api/pagos/');
}
