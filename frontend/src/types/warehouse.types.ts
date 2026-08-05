export interface WarehouseProductItem {
  cod_producto: number;
  sku?: string;
  nombre: string;
  almacen?: string;
  stock_disponible: number;
  stock_reservado?: number;
  stock_minimo?: number;
  estado: string;
  porcentaje_alerta?: number;
}

export interface WarehouseLotItem {
  cod_lote?: number;
  id?: number;
  codigo_lote?: string;
  producto: string;
  almacen?: string;
  cantidad: number;
  disponible?: number;
  fecha_recepcion?: string;
  fecha_vencimiento?: string | null;
  costo_unitario?: string;
}

export interface WarehouseAlertItem {
  cod_alerta?: number;
  id?: number;
  tipo: string;
  severidad: 'CRITICA' | 'ALTA' | 'MEDIA' | 'BAJA' | string;
  producto: string;
  almacen?: string;
  estado: string;
  fecha?: string;
}

export interface WarehouseOrderDetail {
  cod_detalle_pedido?: number;
  producto: string;
  cantidad: number;
  precio_unitario?: string;
  subtotal?: string;
}

export interface WarehouseOrderItem {
  cod_pedido: number;
  estado: string;
  cliente: string;
  fecha: string;
  total: string;
  prioridad?: string;
  almacen_sugerido?: string;
  detalles?: WarehouseOrderDetail[];
}

export interface WarehouseDashboardData {
  stock_critico: number;
  alertas_pendientes: number;
  lotes_proximos: number;
  pedidos_por_preparar: number;
  pedidos_backorder?: number;
  movimientos_recientes?: Array<{
    id: number;
    descripcion: string;
    fecha: string;
  }>;
}
