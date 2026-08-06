export interface AdminSupplierItem {
  cod_proveedor: number;
  ruc: string;
  razon_social: string;
  nombre_comercial: string;
  email: string;
  telefono: string;
  direccion: string;
  ciudad: string;
  provincia: string;
  calificacion: string;
  activo: boolean;
}

export interface AdminSuppliersResponse {
  proveedores: AdminSupplierItem[];
}
