export interface AdminProcurementOrder {
  cod_orden_abastecimiento: number;
  proveedor: string;
  almacen: string | null;
  estado: string;
  total_estimado: string;
  fecha: string;
}

export interface AdminProcurementResponse {
  ordenes: AdminProcurementOrder[];
}
