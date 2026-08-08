import { useCallback, useEffect, useState } from 'react';
import { fetchInvoices } from '../api/invoices.api';
import type { InvoiceItem } from '../types/invoice.types';

export function useInvoices() {
  const [invoices, setInvoices] = useState<InvoiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setInvoices(await fetchInvoices());
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudieron consultar las facturas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { reload(); }, [reload]);
  return { invoices, loading, error, reload };
}
