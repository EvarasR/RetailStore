import { getJSON, postForm } from './http';
import type { AdminPrimeResponse } from '../types/adminPrime.types';

export async function fetchAdminPrime(): Promise<AdminPrimeResponse> {
  return await getJSON<AdminPrimeResponse>('/panel/api/prime/');
}

export async function runAdminPrimeAction(values: Record<string, unknown>): Promise<{ mensaje?: string }> {
  return postForm('/panel/api/control-empresarial/acciones/', values);
}

export async function createAdminPrimeBenefit(values: Record<string, unknown>): Promise<{ mensaje?: string }> {
  return postForm('/panel/api/prime/beneficios/', values);
}

export async function updateAdminPrimeBenefit(codBeneficio: number, values: Record<string, unknown>): Promise<{ mensaje?: string }> {
  return postForm(`/panel/api/prime/beneficios/${codBeneficio}/`, values);
}
