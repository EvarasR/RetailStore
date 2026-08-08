import { useCallback, useEffect, useState } from 'react';
import { addRecurringProduct, createRecurringPurchase, executeRecurringPurchase, fetchRecurringPurchases, updateRecurringPurchase } from '../api/recurringPurchases.api';
import type { RecurringPurchaseItem } from '../types/recurringPurchase.types';

export function useRecurringPurchases() {
  const [purchases, setPurchases] = useState<RecurringPurchaseItem[]>([]);
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reload = useCallback(async () => {
    setLoading(true); setError(null);
    try { const data = await fetchRecurringPurchases(); setPurchases(data.compras || []); setEnabled(data.habilitado); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudieron cargar las compras recurrentes.'); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { reload(); }, [reload]);
  const act = async (operation: Promise<unknown>) => { const result = await operation; await reload(); return result; };
  return {
    purchases, enabled, loading, error, reload,
    create: (values: Record<string, unknown>) => act(createRecurringPurchase(values)),
    update: (id: number, values: Record<string, unknown>) => act(updateRecurringPurchase(id, values)),
    addProduct: (id: number, values: Record<string, unknown>) => act(addRecurringProduct(id, values)),
    execute: (id: number) => act(executeRecurringPurchase(id)),
  };
}
