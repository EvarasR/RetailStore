import { getJSON, postForm } from './http';
import type { MembershipResponse, PaymentMethodsResponse } from '../types/membership.types';

export async function fetchMembershipData(): Promise<MembershipResponse> {
  const data = await getJSON<MembershipResponse>('/api/membresia/');
  return data;
}

export async function fetchPaymentMethods(): Promise<PaymentMethodsResponse> {
  const data = await getJSON<PaymentMethodsResponse>('/operaciones/api/metodos-pago/');
  return data;
}

export async function payMembership(
  cod_plan: string | number,
  cod_metodo_pago: number,
  renovacion_automatica = true,
  idempotency_key = ''
): Promise<{ ok: boolean; mensaje: string; resultado?: unknown }> {
  const payload: Record<string, string | number | boolean> = {
    cod_plan,
    cod_metodo_pago,
    renovacion_automatica: renovacion_automatica ? 'true' : 'false',
  };
  if (idempotency_key) {
    payload.idempotency_key = idempotency_key;
  }
  const res = await postForm('/operaciones/api/prime/pagar/', payload);
  return res as { ok: boolean; mensaje: string; resultado?: unknown };
}

export async function cancelMembership(): Promise<{ ok: boolean; mensaje: string }> {
  const res = await postForm('/api/membresia/cancelar/', {});
  return res as { ok: boolean; mensaje: string };
}
