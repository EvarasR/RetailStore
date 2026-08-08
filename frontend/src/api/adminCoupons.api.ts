import { getJSON, postForm } from './http';
import type { AdminCouponsResponse } from '../types/adminCoupon.types';

export async function fetchAdminCoupons(): Promise<AdminCouponsResponse> {
  return await getJSON<AdminCouponsResponse>('/panel/api/control-empresarial/?modulo=marketing');
}

export async function createAdminCoupon(values: Record<string, unknown>): Promise<{ mensaje?: string }> {
  return postForm('/panel/api/cupones/', values);
}

export async function updateAdminCoupon(codCupon: number, values: Record<string, unknown>): Promise<{ mensaje?: string }> {
  return postForm(`/panel/api/cupones/${codCupon}/`, values);
}
