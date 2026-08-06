export interface AdminInventoryItem {
  cod_producto: number;
  producto: string;
  almacen: string;
  stock_total: number;
  stock_reservado: number;
  stock_disponible: number;
  stock_minimo: number;
  fecha_actualizacion?: string | null;
}

export interface AdminInventoryResponse {
  ok: boolean;
  inventario: AdminInventoryItem[];
}

export interface AdminLoteItem {
  cod_lote: number;
  numero_lote: string;
  producto: string;
  almacen: string;
  proveedor?: string | null;
  disponible: number;
  reservada: number;
  costo: string;
  pvp: string;
  estado: string;
  fecha_recepcion?: string | null;
}

export interface AdminLotesResponse {
  ok: boolean;
  lotes: AdminLoteItem[];
}

export interface AdminAlertItem {
  cod_alerta: number;
  producto: string;
  almacen: string;
  tipo: string;
  mensaje: string;
  atendida: boolean;
  fecha?: string | null;
}

export interface AdminAlertsResponse {
  ok: boolean;
  alertas: AdminAlertItem[];
}
