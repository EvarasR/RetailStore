import { useState, useEffect, useCallback } from 'react';
import { fetchAdminTracking, processPendingTracking } from '../api/adminTracking.api';
import type { AdminTrackingShipment, AdminTrackingSchedule } from '../types/adminTracking.types';

export function useAdminTracking() {
  const [envios, setEnvios] = useState<AdminTrackingShipment[]>([]);
  const [programaciones, setProgramaciones] = useState<AdminTrackingSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadTracking = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminTracking();
      setEnvios(data.envios || []);
      setProgramaciones(data.programaciones || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar tracking operativo.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTracking();
  }, [loadTracking]);

  const handleProcessPending = async () => {
    setActionLoading(true);
    try {
      const res = await processPendingTracking();
      await loadTracking();
      return res;
    } finally {
      setActionLoading(false);
    }
  };

  return { envios, programaciones, loading, error, actionLoading, handleProcessPending, reload: loadTracking };
}
