import { getJSON } from './http';
import type { AdminCouponsResponse } from '../types/adminCoupon.types';

export async function fetchAdminCoupons(): Promise<AdminCouponsResponse> {
  return await getJSON<AdminCouponsResponse>('/panel/api/control-empresarial/?modulo=marketing');
}
