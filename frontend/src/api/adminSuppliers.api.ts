import { getJSON } from './http';
import type { AdminSuppliersResponse } from '../types/adminSupplier.types';

/**
 * Consulta la lista oficial de proveedores en DB
 */
export async function fetchAdminSuppliers(): Promise<AdminSuppliersResponse> {
  return await getJSON<AdminSuppliersResponse>('/panel/api/proveedores/');
}
