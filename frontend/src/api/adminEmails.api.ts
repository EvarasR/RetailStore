import { getJSON, postForm } from './http';

export interface AdminEmailItem {
  cod_email: number;
  fecha: string;
  destinatario: string;
  tipo: string;
  asunto: string;
  estado: string;
  intentos: number;
  max_intentos: number;
  error?: string | null;
  fecha_envio?: string | null;
}

export async function fetchAdminEmails(query = '', status = '') {
  const params = new URLSearchParams();
  if (query) params.set('q', query);
  if (status) params.set('estado', status);
  const result = await getJSON<{ ok: boolean; emails: AdminEmailItem[] }>(`/panel/api/emails/?${params}`);
  return result.emails;
}

export function retryAdminEmail(codEmail: number) {
  return postForm<{ ok: boolean; mensaje: string }>(`/panel/api/emails/${codEmail}/reintentar/`, {});
}
