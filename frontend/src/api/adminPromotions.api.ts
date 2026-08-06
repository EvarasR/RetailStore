import { getJSON } from './http';
import type { AdminPromotionsResponse } from '../types/adminPromotion.types';

export async function fetchAdminPromotions(): Promise<AdminPromotionsResponse> {
  return await getJSON<AdminPromotionsResponse>('/panel/api/control-empresarial/?modulo=marketing');
}
