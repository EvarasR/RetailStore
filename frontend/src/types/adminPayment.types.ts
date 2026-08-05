export interface AdminPaymentTransaction {
  cod_transaccion: number;
  pedido: string;
  monto: string;
  estado: string;
  fecha: string;
}

export interface AdminPaymentAuthorization {
  cod_autorizacion: number;
  transaccion: number;
  monto: string;
  fecha: string;
}

export interface AdminPaymentRefund {
  cod_reembolso: number;
  transaccion: number;
  monto: string;
  estado: string;
  fecha: string;
}

export interface AdminPaymentInvoice {
  cod_factura: number;
  pedido: string;
  numero_factura: string;
  total: string;
  estado: string;
  fecha: string;
}

export interface AdminPaymentReturn {
  cod_devolucion: number;
  pedido: string;
  cliente: string;
  estado: string;
  motivo: string;
  fecha: string;
}

export interface AdminPaymentsResponse {
  transacciones: AdminPaymentTransaction[];
  autorizaciones: AdminPaymentAuthorization[];
  reembolsos: AdminPaymentRefund[];
  facturas: AdminPaymentInvoice[];
  devoluciones: AdminPaymentReturn[];
}
