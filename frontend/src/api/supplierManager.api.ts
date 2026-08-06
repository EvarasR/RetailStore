import { getJSON } from './http';
import type {
  SupplierManagerSupplierItem,
  SupplierManagerProcurementItem,
  SupplierManagerProductItem,
  SupplierManagerMissingItem,
} from '../types/supplierManager.types';

export interface SupplierManagerSuppliersResponse {
  ok: boolean;
  proveedores: SupplierManagerSupplierItem[];
}

export interface SupplierManagerProcurementResponse {
  ok: boolean;
  ordenes: SupplierManagerProcurementItem[];
}

export interface SupplierManagerProductsResponse {
  ok: boolean;
  productos: SupplierManagerProductItem[];
}

export interface SupplierManagerMissingResponse {
  ok: boolean;
  proveedores: SupplierManagerMissingItem[];
}

export async function fetchSupplierManagerSuppliers(): Promise<SupplierManagerSuppliersResponse> {
  const data = await getJSON<SupplierManagerSuppliersResponse>('/panel/api/proveedores/');
  return data;
}

export async function fetchSupplierManagerProcurement(): Promise<SupplierManagerProcurementResponse> {
  const data = await getJSON<SupplierManagerProcurementResponse>('/panel/api/abastecimiento/');
  return data;
}

export async function fetchSupplierManagerProducts(): Promise<SupplierManagerProductsResponse> {
  const data = await getJSON<SupplierManagerProductsResponse>('/panel/api/productos/');
  return data;
}

export async function fetchSupplierManagerActiveList(): Promise<SupplierManagerSuppliersResponse> {
  const data = await getJSON<SupplierManagerSuppliersResponse>('/proveedores/api/lista/');
  return data;
}

export async function fetchSuppliersForMissing(
  cod_producto: number,
  cantidad = 1
): Promise<SupplierManagerMissingResponse> {
  const data = await getJSON<SupplierManagerMissingResponse>(
    `/proveedores/api/producto/${cod_producto}/faltante/?cantidad=${cantidad}`
  );
  return data;
}
