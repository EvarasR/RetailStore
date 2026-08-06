import { useState, useEffect, useCallback } from 'react';
import { fetchAdminSummary } from '../api/admin.api';
import type {
  AdminDashboardCards,
  AdminOrderStatusCount,
  AdminDailySale,
  AdminKpiItem,
} from '../types/admin.types';

export function useAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tarjetas, setTarjetas] = useState<AdminDashboardCards | null>(null);
  const [estadosPedido, setEstadosPedido] = useState<AdminOrderStatusCount[]>([]);
  const [ventasDiarias, setVentasDiarias] = useState<AdminDailySale[]>([]);
  const [kpis, setKpis] = useState<AdminKpiItem[]>([]);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminSummary();
      setTarjetas(data.tarjetas || null);
      setEstadosPedido(data.estados_pedido || []);
      setVentasDiarias(data.ventas_diarias || []);
      setKpis(data.kpis || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar resumen ejecutivo corporativo.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  return {
    loading,
    error,
    tarjetas,
    estadosPedido,
    ventasDiarias,
    kpis,
    refresh: loadDashboard,
  };
}
