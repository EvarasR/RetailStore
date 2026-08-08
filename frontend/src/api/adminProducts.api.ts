import { getJSON, postForm } from './http';
import type { AdminProductsResponse, AdminProductActionResponse } from '../types/adminProduct.types';

/**
 * Consulta la lista oficial de productos del panel administrativo
 */
export async function fetchAdminProducts(q = '', estado = '', categoria = '', proveedor = ''): Promise<AdminProductsResponse> {
  const params = new URLSearchParams();
  if (q.trim()) params.append('q', q.trim());
  if (estado.trim()) params.append('estado', estado.trim());
  if (categoria.trim()) params.append('categoria', categoria.trim());
  if (proveedor.trim()) params.append('proveedor', proveedor.trim());
  const queryStr = params.toString() ? `?${params.toString()}` : '';
  const data = await getJSON<AdminProductsResponse>(`/panel/api/productos/${queryStr}`);
  return data;
}

/**
 * Publica un producto validado en BD
 */
export async function publishAdminProduct(cod_producto: number): Promise<AdminProductActionResponse> {
  const res = await postForm(`/panel/api/productos/${cod_producto}/publicar/`, {});
  return res as AdminProductActionResponse;
}

/**
 * Pausa la venta de un producto en BD
 */
export async function pauseAdminProduct(cod_producto: number): Promise<AdminProductActionResponse> {
  const res = await postForm(`/panel/api/productos/${cod_producto}/pausar/`, {});
  return res as AdminProductActionResponse;
}

/**
 * Desactiva un producto en BD
 */
export async function deactivateAdminProduct(cod_producto: number): Promise<AdminProductActionResponse> {
  const res = await postForm(`/panel/api/productos/${cod_producto}/desactivar/`, {});
  return res as AdminProductActionResponse;
}

export async function createAdminProduct(values: Record<string, unknown>): Promise<{ mensaje?: string }> {
  return postForm('/panel/api/productos/crear/', values);
}
