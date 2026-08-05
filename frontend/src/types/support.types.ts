export interface SupportTicketMessage {
  cod_mensaje: number;
  autor: string;
  mensaje: string;
  fecha?: string | null;
}

export interface SupportTicketItem {
  cod_ticket: number;
  asunto: string;
  categoria: string;
  prioridad: string;
  estado: string;
  fecha?: string | null;
  mensajes: SupportTicketMessage[];
}

export interface SupportTicketsResponse {
  ok: boolean;
  tickets: SupportTicketItem[];
}

export interface CreateTicketPayload {
  asunto: string;
  categoria: string;
  prioridad: string;
  mensaje: string;
}
