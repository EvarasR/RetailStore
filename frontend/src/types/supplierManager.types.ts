export interface SupplierManagerSupplierItem {
  cod_proveedor: number;
  ruc?: string;
  razon_social: string;
  nombre_comercial?: string;
  email?: string;
  telefono?: string;
  ciudad?: string;
  provincia?: string;
  calificacion?: string;
  activo?: boolean;
}

export interface SupplierManagerProcurementItem {
  cod_orden_abastecimiento: number;
  proveedor?: string;
  almacen?: string;
  estado: string;
  total_estimado: string;
  fecha_creacion?: string;
  fecha_estimada?: string;
  prioridad?: string;
}

export interface SupplierManagerProductItem {
  cod_producto_proveedor?: number;
  cod_producto?: number;
  sku?: string;
  producto: string;
  proveedor?: string;
  costo_unitario?: string;
  tiempo_entrega_dias?: number;
  stock_disponible?: number;
  activo?: boolean;
}

export interface SupplierManagerMissingItem {
  cod_proveedor: number;
  razon_social: string;
  calificacion: string;
  costo_unitario: string;
  tiempo_entrega_dias: number;
  stock_disponible: number;
}

export interface SupplierManagerDashboardData {
  proveedores_activos: number;
  productos_con_faltante: number;
  ordenes_pendientes: number;
  tiempo_promedio_dias?: number;
  cumplimiento_promedio?: string;
}
