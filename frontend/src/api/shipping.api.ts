import { getJSON } from './http';
import type { ShippingMethod, ShippingMethodsData } from '../types/checkout.types';

export async function fetchShippingMethods(): Promise<ShippingMethod[]> {
  const res = await getJSON<ShippingMethodsData>('/operaciones/api/metodos-envio/');
  return res.metodos || [];
}
