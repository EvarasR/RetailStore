import { getJSON, postForm } from './http';
import type {
  SupportTicketItem,
  SupportOrderItem,
  SupportIncidentItem,
} from '../types/supportInternal.types';

export interface SupportTicketsResponse {
  ok: boolean;
  tickets: SupportTicketItem[];
  notificaciones?: Array<{
    cod_notificacion: number;
    cliente: string;
    tipo: string;
    titulo: string;
    leida: boolean;
    fecha: string;
  }>;
}

export interface SupportOrdersResponse {
  ok: boolean;
  pedidos: SupportOrderItem[];
}

export interface SupportIncidentsResponse {
  ok: boolean;
  incidencias: SupportIncidentItem[];
}

/**
 * Carga todos los tickets del sistema consumiendo el módulo corporativo de soporte
 */
export async function fetchSupportTickets(): Promise<SupportTicketsResponse> {
  const data = await getJSON<SupportTicketsResponse>('/panel/api/control-empresarial/?modulo=soporte');
  return data;
}

/**
 * Responde un ticket en BD
 */
export async function respondSupportTicket(
  cod_ticket: number,
  mensaje: string,
  estado = 'EN_PROCESO',
  interno = false
): Promise<{ ok: boolean; mensaje?: string }> {
  // Intentamos por endpoint corporativo de acciones administrativas si está disponible
  const res = await postForm('/panel/api/control-empresarial/acciones/', {
    accion: 'responder_ticket',
    cod_ticket: String(cod_ticket),
    mensaje,
    estado,
    interno: interno ? 'true' : 'false',
  });
  return res as { ok: boolean; mensaje?: string };
}

/**
 * Cambia estado o cierra un ticket en BD
 */
export async function closeSupportTicket(
  cod_ticket: number,
  mensaje = 'Ticket resuelto por el equipo de Soporte TechTail'
): Promise<{ ok: boolean; mensaje?: string }> {
  const res = await postForm('/panel/api/control-empresarial/acciones/', {
    accion: 'estado_ticket',
    cod_ticket: String(cod_ticket),
    estado: 'RESUELTO',
    mensaje,
  });
  return res as { ok: boolean; mensaje?: string };
}

/**
 * Carga pedidos del sistema para consulta del equipo de soporte
 */
export async function fetchSupportOrders(): Promise<SupportOrdersResponse> {
  const data = await getJSON<SupportOrdersResponse>('/panel/api/pedidos/');
  return data;
}

/**
 * Consulta el detalle de líneas de un pedido en BD
 */
export async function fetchSupportOrderDetail(
  cod_pedido: number
): Promise<{ ok: boolean; linea_pedidos: unknown[] }> {
  const data = await getJSON<{ ok: boolean; linea_pedidos: unknown[] }>(
    `/panel/api/pedidos/${cod_pedido}/detalle/`
  );
  return data;
}

