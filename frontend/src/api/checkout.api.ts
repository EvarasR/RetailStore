import { postForm } from './http';
import type { CreateOrderResult } from '../types/checkout.types';

export async function createOrder(
  cod_direccion_envio: number,
  cod_metodo_envio?: number,
  cod_zona_entrega?: number
): Promise<CreateOrderResult> {
  const payload: Record<string, string | number> = {
    cod_direccion_envio,
  };
  if (cod_metodo_envio) {
    payload.cod_metodo_envio = cod_metodo_envio;
  }
  if (cod_zona_entrega) {
    payload.cod_zona_entrega = cod_zona_entrega;
  }
  const res = await postForm<CreateOrderResult>('/api/checkout/crear-pedido/', payload);
  return res;
}
