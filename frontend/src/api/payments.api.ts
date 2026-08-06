import { getJSON, postForm } from './http';
import type {
  PaymentMethod,
  PaymentMethodsData,
  PaymentAuthorizationResult,
  PaymentCaptureResult,
} from '../types/payment.types';

export async function fetchPaymentMethods(): Promise<PaymentMethod[]> {
  const res = await getJSON<PaymentMethodsData>('/operaciones/api/metodos-pago/');
  return res.metodos || [];
}

export async function registerPaymentMethod(data: {
  numero_tarjeta: string;
  titular: string;
  exp_mes: string | number;
  exp_anio: string | number;
  cvv: string;
}): Promise<{ ok: boolean; mensaje: string; cod_metodo_pago?: number }> {
  const res = await postForm<{ ok: boolean; mensaje: string; cod_metodo_pago?: number }>(
    '/operaciones/api/metodos-pago/registrar/',
    data
  );
  return {
    ok: Boolean(res?.ok !== false),
    mensaje: String(res?.mensaje || 'Método de pago registrado.'),
    cod_metodo_pago: res?.cod_metodo_pago ? Number(res.cod_metodo_pago) : undefined,
  };
}

export async function authorizePayment(data: {
  cod_pedido: number;
  cod_metodo_pago: number;
  idempotency_key: string;
}): Promise<PaymentAuthorizationResult> {
  const res = await postForm<PaymentAuthorizationResult>('/operaciones/api/pagos/autorizar/', data);
  return res;
}

export async function capturePayment(cod_transaccion: number): Promise<PaymentCaptureResult> {
  const res = await postForm<PaymentCaptureResult>('/operaciones/api/pagos/capturar/', {
    cod_transaccion,
  });
  return res;
}
