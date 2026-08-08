import { getJSON } from './http';
import type { InvoiceItem } from '../types/invoice.types';

export async function fetchInvoices(): Promise<InvoiceItem[]> {
  const response = await getJSON<{ ok: boolean; facturas: InvoiceItem[] }>('/operaciones/api/facturas/');
  return response.facturas || [];
}
