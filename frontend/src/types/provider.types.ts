export interface ProviderInfo {
  cod_proveedor: number;
  razon_social: string;
  calificacion?: string;
  ciudad?: string;
}

export interface ProviderProductItem {
  cod_producto_proveedor: number;
  producto: string;
  sku_proveedor?: string;
  costo_unitario: string;
  tiempo_entrega_dias: number;
  prioridad?: number;
  stock_disponible: number;
  activo: boolean;
}

export interface ProviderOrderItem {
  cod_orden_abastecimiento: number;
  estado: string;
  almacen?: string | null;
  total_estimado: string;
  fecha: string;
}

export interface ProviderHistoryItem {
  evento: string;
  descripcion: string;
  fecha: string;
}

export interface ProviderPanelResponse {
  ok: boolean;
  proveedor: ProviderInfo;
  productos: ProviderProductItem[];
  ordenes: ProviderOrderItem[];
  historial: ProviderHistoryItem[];
}
