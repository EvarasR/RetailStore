import { useState, useEffect, useCallback } from 'react';
import {
  fetchSupplierManagerSuppliers,
  fetchSupplierManagerProcurement,
  fetchSupplierManagerProducts,
  fetchSuppliersForMissing,
} from '../api/supplierManager.api';
import type {
  SupplierManagerSupplierItem,
  SupplierManagerProcurementItem,
  SupplierManagerProductItem,
  SupplierManagerMissingItem,
  SupplierManagerDashboardData,
} from '../types/supplierManager.types';

export function useSupplierManager() {
  const [proveedores, setProveedores] = useState<SupplierManagerSupplierItem[]>([]);
  const [ordenes, setOrdenes] = useState<SupplierManagerProcurementItem[]>([]);
  const [productos, setProductos] = useState<SupplierManagerProductItem[]>([]);
  const [missingSuppliers, setMissingSuppliers] = useState<SupplierManagerMissingItem[]>([]);
  const [dashboard, setDashboard] = useState<SupplierManagerDashboardData>({
    proveedores_activos: 0,
    productos_con_faltante: 0,
    ordenes_pendientes: 0,
    tiempo_promedio_dias: 3,
    cumplimiento_promedio: '98.4%',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchingMissing, setSearchingMissing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [provRes, ordRes, prodRes] = await Promise.all([
        fetchSupplierManagerSuppliers().catch(() => ({ ok: false, proveedores: [] as SupplierManagerSupplierItem[] })),
        fetchSupplierManagerProcurement().catch(() => ({ ok: false, ordenes: [] as SupplierManagerProcurementItem[] })),
        fetchSupplierManagerProducts().catch(() => ({ ok: false, productos: [] as SupplierManagerProductItem[] })),
      ]);

      const provs = provRes.proveedores || [];
      const ords = ordRes.ordenes || [];
      const prods = prodRes.productos || [];

      setProveedores(provs);
      setOrdenes(ords);
      setProductos(prods);

      setDashboard({
        proveedores_activos: provs.length,
        productos_con_faltante: prods.filter((p) => (p.stock_disponible || 0) <= 5).length,
        ordenes_pendientes: ords.filter((o) => ['PENDIENTE', 'EN_REVISION', 'SOLICITADA'].includes(o.estado)).length,
        tiempo_promedio_dias: 4,
        cumplimiento_promedio: '99.1%',
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error cargando datos de Supplier Manager');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadMissingForProduct = async (cod_producto: number, cantidad = 1) => {
    setSearchingMissing(true);
    try {
      const res = await fetchSuppliersForMissing(cod_producto, cantidad);
      const list = res.proveedores || [];
      setMissingSuppliers(list);
      return list;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo buscar proveedores para stock faltante';
      throw new Error(msg);
    } finally {
      setSearchingMissing(false);
    }
  };

  return {
    proveedores,
    ordenes,
    productos,
    missingSuppliers,
    dashboard,
    loading,
    error,
    searchingMissing,
    loadMissingForProduct,
    reload: loadData,
  };
}
