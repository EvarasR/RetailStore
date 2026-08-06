export interface AdminDashboardCards {
  productos: number;
  productos_publicados: number;
  pedidos: number;
  ventas: string | number;
  clientes: number;
  proveedores: number;
  alertas_stock: number;
  carritos_activos: number;
}

export interface AdminOrderStatusCount {
  estado: string;
  total: number;
}

export interface AdminDailySale {
  fecha: string;
  total_pedidos: number;
  total_ventas: string | number;
  ticket_promedio: string | number;
}

export interface AdminKpiItem {
  nombre: string;
  valor: string | number;
  unidad: string;
  fecha?: string | null;
}

export interface AdminSummaryResponse {
  ok: boolean;
  tarjetas: AdminDashboardCards;
  estados_pedido: AdminOrderStatusCount[];
  ventas_diarias: AdminDailySale[];
  kpis: AdminKpiItem[];
}
