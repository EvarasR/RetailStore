import { getJSON, postForm } from './http';
import type { AdminProcurementResponse } from '../types/adminProcurement.types';

export async function fetchAdminProcurement(): Promise<AdminProcurementResponse> {
  return await getJSON<AdminProcurementResponse>('/panel/api/abastecimiento/');
}

export async function processProcurementOrder(
  cod_orden: number,
  accion: 'recibir' | 'cancelar',
  cod_almacen = 1,
  observacion = 'Procesado desde panel React'
): Promise<{ ok: boolean; mensaje?: string }> {
  const payload: Record<string, string | number> = { accion };
  if (accion === 'recibir') {
    payload.cod_almacen = cod_almacen;
    payload.observacion = observacion;
  } else {
    payload.motivo = observacion;
  }
  const res = await postForm(`/panel/api/abastecimiento/${cod_orden}/accion/`, payload);
  return res as { ok: boolean; mensaje?: string };
}
