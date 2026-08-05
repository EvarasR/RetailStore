import { getJSON, postForm } from './http';
import type { Address, UbicacionesData } from '../types/address.types';

export async function fetchAddresses(): Promise<Address[]> {
  const res = await getJSON<{ ok: boolean; direcciones: Address[] }>('/api/direcciones/');
  return res.direcciones || [];
}

export async function fetchLocations(cod_provincia?: string | number): Promise<UbicacionesData> {
  const query = cod_provincia ? `?cod_provincia=${cod_provincia}` : '';
  return getJSON<UbicacionesData>(`/api/ubicaciones/${query}`);
}

export async function createAddress(data: Record<string, string | number | boolean>): Promise<{ ok: boolean; mensaje: string; cod_direccion?: number }> {
  const res = await postForm<{ ok: boolean; mensaje: string; cod_direccion?: number }>('/api/direcciones/crear/', data);
  return {
    ok: Boolean(res?.ok !== false),
    mensaje: String(res?.mensaje || 'Dirección creada.'),
    cod_direccion: res?.cod_direccion ? Number(res.cod_direccion) : undefined,
  };
}

export async function updateAddress(cod_direccion: number, data: Record<string, string | number | boolean>): Promise<{ ok: boolean; mensaje: string }> {
  const res = await postForm<{ ok: boolean; mensaje: string }>(`/api/direcciones/${cod_direccion}/actualizar/`, data);
  return {
    ok: Boolean(res?.ok !== false),
    mensaje: String(res?.mensaje || 'Dirección actualizada.'),
  };
}

export async function deleteAddress(cod_direccion: number): Promise<{ ok: boolean; mensaje: string }> {
  const res = await postForm<{ ok: boolean; mensaje: string }>(`/api/direcciones/${cod_direccion}/eliminar/`, {});
  return {
    ok: Boolean(res?.ok !== false),
    mensaje: String(res?.mensaje || 'Dirección eliminada.'),
  };
}
