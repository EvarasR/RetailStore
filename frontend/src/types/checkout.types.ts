export interface ShippingMethod {
  cod_metodo_envio: number;
  nombre: string;
  dias_min: number;
  dias_max: number;
  costo_base: string;
  es_premium_gratis: boolean;
}

export interface ShippingMethodsData {
  ok: boolean;
  metodos: ShippingMethod[];
}

export interface CreateOrderResult {
  ok: boolean;
  mensaje: string;
  cod_pedido?: number;
  estado?: string;
  subtotal?: string;
  descuento?: string;
  impuesto?: string;
  costo_envio?: string;
  total?: string;
  resultado?: unknown;
}
