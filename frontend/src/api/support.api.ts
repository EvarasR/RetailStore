import { getJSON, postForm } from './http';
import type { SupportTicketsResponse, CreateTicketPayload } from '../types/support.types';

export async function fetchSupportTickets(): Promise<SupportTicketsResponse> {
  const data = await getJSON<SupportTicketsResponse>('/operaciones/api/soporte/tickets/');
  return data;
}

export async function createSupportTicket(payload: CreateTicketPayload): Promise<{ ok: boolean; mensaje: string; cod_ticket?: number }> {
  const res = await postForm('/operaciones/api/soporte/tickets/crear/', {
    asunto: payload.asunto,
    categoria: payload.categoria,
    prioridad: payload.prioridad,
    mensaje: payload.mensaje,
  });
  return res as { ok: boolean; mensaje: string; cod_ticket?: number };
}

export async function respondSupportTicket(cod_ticket: number, mensaje: string): Promise<{ ok: boolean; mensaje: string; cod_ticket_mensaje?: number }> {
  const res = await postForm(`/operaciones/api/soporte/tickets/${cod_ticket}/responder/`, {
    mensaje,
  });
  return res as { ok: boolean; mensaje: string; cod_ticket_mensaje?: number };
}

export async function closeSupportTicket(cod_ticket: number, mensaje = 'Ticket cerrado por el cliente'): Promise<{ ok: boolean; mensaje: string }> {
  const res = await postForm(`/operaciones/api/soporte/tickets/${cod_ticket}/cerrar/`, {
    mensaje,
  });
  return res as { ok: boolean; mensaje: string };
}
