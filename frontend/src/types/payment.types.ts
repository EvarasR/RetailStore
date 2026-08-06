export interface PaymentMethod {
  cod_metodo_pago: number;
  tipo: string;
  marca: string;
  bin6: string;
  ultimos4: string;
  titular: string;
  exp_mes: number | string;
  exp_anio: number | string;
  fecha_creacion?: string;
  saldo_disponible?: string | null;
  limite_diario?: string | null;
  monto_usado_hoy?: string | null;
  bloqueada?: boolean;
}

export interface PaymentMethodsData {
  ok: boolean;
  metodos: PaymentMethod[];
}

export interface PaymentAuthorizationResult {
  ok: boolean;
  mensaje?: string;
  cod_transaccion?: number;
  estado_pago?: string;
  monto?: string;
}

export interface PaymentCaptureResult {
  ok: boolean;
  mensaje?: string;
  cod_pedido?: number;
  numero_pedido?: string;
  numero_factura?: string | null;
  factura?: {
    numero_factura: string;
    subtotal: string;
    descuento: string;
    impuesto: string;
    costo_envio: string;
    total: string;
  } | null;
}
