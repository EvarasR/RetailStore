import { getJSON, postForm } from './http';
import type { AdminSuppliersResponse } from '../types/adminSupplier.types';

/**
 * Consulta la lista oficial de proveedores en DB
 */
export async function fetchAdminSuppliers(): Promise<AdminSuppliersResponse> {
  return await getJSON<AdminSuppliersResponse>('/panel/api/proveedores/');
}

export async function createAdminSupplier(values: Record<string, unknown>): Promise<{ mensaje?: string }> {
  return postForm('/panel/api/proveedores/crear/', values);
}

export async function updateAdminSupplier(codProveedor: number, values: Record<string, unknown>): Promise<{ mensaje?: string }> {
  return postForm(`/panel/api/proveedores/${codProveedor}/`, values);
}
