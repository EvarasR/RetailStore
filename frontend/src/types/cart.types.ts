export interface CartCotizacion {
  cantidad_solicitada: number;
  cantidad_cubierta: number;
  cantidad_faltante: number;
  subtotal_total: string;
  requiere_proveedor?: boolean;
  tiempo_estimado_dias?: number | null;
  mensajes?: string[];
}

export interface CartItem {
  cod_producto: number;
  nombre: string;
  marca: string;
  imagen: string;
  cantidad: number;
  precio_unitario: string;
  subtotal: string;
  cotizacion?: CartCotizacion | null;
}

export interface CartDesglose {
  subtotal_carrito: string;
  descuento: string | null;
  impuesto: string | null;
  costo_envio: string | null;
  total_estimado: string;
  mensaje?: string;
}

export interface CartData {
  ok: boolean;
  cod_carrito: number;
  total: string;
  cantidad_items: number;
  items: CartItem[];
  desglose?: CartDesglose;
}

export interface CartValidationResult {
  ok: boolean;
  resultado?: {
    valido: boolean;
    mensajes?: string[];
    [key: string]: unknown;
  };
}
