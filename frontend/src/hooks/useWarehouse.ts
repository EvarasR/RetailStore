import { useState, useEffect, useCallback } from 'react';
import {
  fetchWarehouseInventory,
  fetchWarehouseLots,
  fetchWarehouseAlerts,
  fetchWarehouseOrders,
  executeWarehouseAction,
  changeWarehouseOrderState,
  resolveWarehouseAlert,
  fetchWarehouseOrderDetail,
} from '../api/warehouse.api';
import type {
  WarehouseProductItem,
  WarehouseLotItem,
  WarehouseAlertItem,
  WarehouseOrderItem,
  WarehouseDashboardData,
} from '../types/warehouse.types';

export function useWarehouse() {
  const [productos, setProductos] = useState<WarehouseProductItem[]>([]);
  const [lotes, setLotes] = useState<WarehouseLotItem[]>([]);
  const [alertas, setAlertas] = useState<WarehouseAlertItem[]>([]);
  const [pedidos, setPedidos] = useState<WarehouseOrderItem[]>([]);
  const [dashboard, setDashboard] = useState<WarehouseDashboardData>({
    stock_critico: 0,
    alertas_pendientes: 0,
    lotes_proximos: 0,
    pedidos_por_preparar: 0,
    pedidos_backorder: 0,
    movimientos_recientes: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [invRes, lotRes, altRes, pedRes] = await Promise.all([
        fetchWarehouseInventory().catch(() => ({ ok: false, products: [] as WarehouseProductItem[], productos: [] as WarehouseProductItem[] })),
        fetchWarehouseLots().catch(() => ({ ok: false, lotes: [] as WarehouseLotItem[] })),
        fetchWarehouseAlerts().catch(() => ({ ok: false, alertas: [] as WarehouseAlertItem[] })),
        fetchWarehouseOrders().catch(() => ({ ok: false, pedidos: [] as WarehouseOrderItem[] })),
      ]);

      const prods = invRes.productos || [];
      const lots = lotRes.lotes || [];
      const alts = altRes.alertas || [];
      const peds = pedRes.pedidos || [];

      setProductos(prods);
      setLotes(lots);
      setAlertas(alts);
      setPedidos(peds);

      // Calculo expositivo DB-First basado en datos devueltos (cero reglas ad-hoc)
      const prep = peds.filter((p) =>
        ['PAGADO', 'VERIFICADO', 'CONFIRMADO', 'EN_PREPARACION'].includes(p.estado)
      ).length;
      const crit = prods.filter((p) => p.estado === 'SIN_STOCK' || p.estado === 'STOCK_CRITICO').length;

      setDashboard({
        stock_critico: crit,
        alertas_pendientes: alts.length,
        lotes_proximos: lots.length,
        pedidos_por_preparar: prep,
        pedidos_backorder: peds.filter((p) => p.estado === 'RETENIDO').length,
        movimientos_recientes: alts.slice(0, 5).map((a, i) => ({
          id: i + 1,
          descripcion: `Alerta ${a.tipo} en SKU: ${a.producto}`,
          fecha: a.fecha || 'Hoy',
        })),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error cargando datos operativos de almacén');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAction = async (
    accion: string,
    cod_producto?: number,
    cantidad?: number,
    cod_almacen?: number
  ) => {
    setActionLoading(true);
    try {
      const res = await executeWarehouseAction(accion, cod_producto, cantidad, cod_almacen);
      await loadData();
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Fallo en la acción de inventario';
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleOrderState = async (cod_pedido: number, estado: string, comentario?: string) => {
    setActionLoading(true);
    try {
      const res = await changeWarehouseOrderState(cod_pedido, estado, comentario);
      await loadData();
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Fallo cambiando estado del pedido';
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleResolveAlert = async (cod_alerta: number, observacion?: string) => {
    setActionLoading(true);
    try {
      const res = await resolveWarehouseAlert(cod_alerta, observacion);
      await loadData();
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Fallo resolviendo la alerta de stock';
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  const handleFetchOrderDetail = async (cod_pedido: number) => {
    try {
      const res = await fetchWarehouseOrderDetail(cod_pedido);
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo cargar el detalle del pedido';
      throw new Error(msg);
    }
  };

  return {
    productos,
    lotes,
    alertas,
    pedidos,
    dashboard,
    loading,
    error,
    actionLoading,
    handleAction,
    handleOrderState,
    handleResolveAlert,
    handleFetchOrderDetail,
    reload: loadData,
  };
}
