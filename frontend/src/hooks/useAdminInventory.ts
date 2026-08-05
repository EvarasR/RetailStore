import { useState, useEffect, useCallback } from 'react';
import {
  fetchAdminInventory,
  fetchAdminLotes,
  fetchAdminAlerts,
  executeAdminInventoryAction,
} from '../api/adminInventory.api';
import type {
  AdminInventoryItem,
  AdminLoteItem,
  AdminAlertItem,
} from '../types/adminInventory.types';

export function useAdminInventory() {
  const [inventory, setInventory] = useState<AdminInventoryItem[]>([]);
  const [lotes, setLotes] = useState<AdminLoteItem[]>([]);
  const [alerts, setAlerts] = useState<AdminAlertItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [invData, lotesData, alertsData] = await Promise.all([
        fetchAdminInventory(),
        fetchAdminLotes(),
        fetchAdminAlerts(),
      ]);
      setInventory(invData.inventario || []);
      setLotes(lotesData.lotes || []);
      setAlerts(alertsData.alertas || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al consultar inventarios en almacén.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleAction = async (payload: Record<string, unknown>) => {
    const res = await executeAdminInventoryAction(payload);
    await loadAll();
    return res;
  };

  return {
    inventory,
    lotes,
    alerts,
    loading,
    error,
    refresh: loadAll,
    handleAction,
  };
}
