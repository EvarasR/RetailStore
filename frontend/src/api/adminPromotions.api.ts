import { getJSON, postForm } from './http';
import type { AdminPromotionsResponse } from '../types/adminPromotion.types';

export async function fetchAdminPromotions(): Promise<AdminPromotionsResponse> {
  return await getJSON<AdminPromotionsResponse>('/panel/api/control-empresarial/?modulo=marketing');
}

export async function createAdminPromotion(values: Record<string, unknown>): Promise<{ mensaje?: string; cod_promocion?: number }> {
  return postForm('/panel/api/promociones/', values);
}

export async function updateAdminPromotion(codPromocion: number, values: Record<string, unknown>): Promise<{ mensaje?: string }> {
  return postForm(`/panel/api/promociones/${codPromocion}/`, values);
}

export async function associateAdminPromotionProduct(codPromocion: number, values: Record<string, unknown>): Promise<{ mensaje?: string }> {
  return postForm(`/panel/api/promociones/${codPromocion}/productos/`, values);
}
