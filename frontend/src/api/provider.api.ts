import { getJSON, postForm } from './http';
import type { ProviderPanelResponse } from '../types/provider.types';

export async function fetchProviderDashboard(cod_proveedor?: number): Promise<ProviderPanelResponse> {
  const query = cod_proveedor ? `?cod_proveedor=${cod_proveedor}` : '';
  const data = await getJSON<ProviderPanelResponse>(`/proveedores/api/mi-panel/${query}`);
  return data;
}

export async function updateProviderStock(
  cod_producto_proveedor: number,
  cantidad_disponible: number
): Promise<{ ok: boolean; mensaje?: string }> {
  // Obligatorio: Enviar FormData por require_POST
  const res = await postForm('/proveedores/api/stock/actualizar/', {
    cod_producto_proveedor: String(cod_producto_proveedor),
    cantidad_disponible: String(cantidad_disponible),
  });
  return res as { ok: boolean; mensaje?: string };
}
