export interface AdminCouponItem {
  cod_cupon: number;
  codigo: string;
  nombre: string;
  tipo: string;
  valor: string;
  monto_minimo: string;
  usos_maximos: number;
  usos_por_usuario: number;
  inicio: string;
  fin: string;
  activo: boolean;
}

export interface AdminCouponUsage {
  cod_uso: number;
  cupon: string;
  cliente: string;
  pedido: string;
  valor: string;
  fecha: string;
}

export interface AdminCouponsResponse {
  cupones: AdminCouponItem[];
  usos: AdminCouponUsage[];
}
