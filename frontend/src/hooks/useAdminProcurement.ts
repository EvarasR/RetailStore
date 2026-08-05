import { useState, useEffect, useCallback } from 'react';
import { fetchAdminProcurement, processProcurementOrder } from '../api/adminProcurement.api';
import type { AdminProcurementOrder } from '../types/adminProcurement.types';

export function useAdminProcurement() {
  const [orders, setOrders] = useState<AdminProcurementOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminProcurement();
      setOrders(data.ordenes || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar abastecimiento.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleAction = async (cod_orden: number, accion: 'recibir' | 'cancelar', observacion?: string) => {
    setActionLoading(cod_orden);
    try {
      const res = await processProcurementOrder(cod_orden, accion, 1, observacion);
      await loadOrders();
      return res;
    } finally {
      setActionLoading(null);
    }
  };

  return { orders, loading, error, actionLoading, handleAction, reload: loadOrders };
}
