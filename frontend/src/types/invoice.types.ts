export interface InvoiceItem {
  cod_factura: number;
  cod_pedido: number;
  numero_factura: string;
  numero_pedido: string;
  subtotal: string;
  descuento: string;
  impuesto: string;
  tasa_impuesto: string;
  costo_envio: string;
  total: string;
  estado: string;
  fecha_emision: string;
  pdf_url: string;
  detalle_url: string;
}
