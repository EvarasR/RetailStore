import { getJSON, postForm } from './http';
import type { InvoiceItem } from '../types/invoice.types';

export async function fetchInvoices(): Promise<InvoiceItem[]> {
  const response = await getJSON<{ ok: boolean; facturas: InvoiceItem[] }>('/operaciones/api/facturas/');
  return response.facturas || [];
}

export function resendInvoice(codFactura: number) {
  return postForm<{ ok: boolean; mensaje: string }>(`/operaciones/api/facturas/${codFactura}/reenviar/`, {});
}
