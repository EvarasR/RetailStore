export interface SupportMessageItem {
  cod_mensaje: number;
  autor: string;
  mensaje: string;
  interno?: boolean;
  fecha: string;
}

export interface SupportTicketItem {
  cod_ticket: number;
  cod_usuario?: number;
  cliente?: string;
  email?: string;
  asunto: string;
  categoria: string;
  prioridad: string;
  estado: string;
  fecha: string;
  mensajes?: SupportMessageItem[];
}

export interface SupportOrderItem {
  cod_pedido: number;
  estado: string;
  cliente: string;
  fecha: string;
  total: string;
  tracking?: string;
  incidencia?: string;
}

export interface SupportIncidentItem {
  cod_incidencia?: number;
  cod_pedido?: number;
  cliente?: string;
  descripcion: string;
  estado: string;
  fecha: string;
}

export interface SupportDashboardData {
  tickets_abiertos: number;
  tickets_urgentes: number;
  pedidos_con_incidencia: number;
  devoluciones_pendientes: number;
  clientes_recientes?: number;
}
