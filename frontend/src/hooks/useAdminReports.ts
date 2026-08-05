import { useState, useEffect, useCallback } from 'react';
import { fetchAdminReports } from '../api/adminReports.api';
import type { AdminReportSaleDay } from '../types/adminReport.types';

export function useAdminReports() {
  const [ventas, setVentas] = useState<AdminReportSaleDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminReports();
      setVentas(data.ventas || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar reporte oficial de ventas.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  return { ventas, loading, error, reload: loadReports };
}
