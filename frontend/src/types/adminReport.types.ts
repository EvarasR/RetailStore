export interface AdminReportSaleDay {
  fecha: string;
  total_pedidos: number;
  total_clientes: number;
  total_ventas: string;
  ticket_promedio: string;
}

export interface AdminReportsResponse {
  ventas: AdminReportSaleDay[];
}
