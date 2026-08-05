import { useState, useEffect, useCallback } from 'react';
import { fetchProviderDashboard, updateProviderStock } from '../api/provider.api';
import type {
  ProviderInfo,
  ProviderProductItem,
  ProviderOrderItem,
  ProviderHistoryItem,
} from '../types/provider.types';

export function useProviderPortal(cod_proveedor_param?: number) {
  const [proveedor, setProveedor] = useState<ProviderInfo | null>(null);
  const [productos, setProductos] = useState<ProviderProductItem[]>([]);
  const [ordenes, setOrdenes] = useState<ProviderOrderItem[]>([]);
  const [historial, setHistorial] = useState<ProviderHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchProviderDashboard(cod_proveedor_param);
      if (!data.ok) {
        throw new Error('Fallo al obtener datos del Portal Proveedor');
      }
      setProveedor(data.proveedor);
      setProductos(data.productos || []);
      setOrdenes(data.ordenes || []);
      setHistorial(data.historial || []);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo acceder al Portal Proveedor o falta asociación de cuenta'
      );
    } finally {
      setLoading(false);
    }
  }, [cod_proveedor_param]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleUpdateStock = async (cod_producto_proveedor: number, cantidad: number) => {
    setActionLoading(true);
    try {
      const res = await updateProviderStock(cod_producto_proveedor, cantidad);
      await loadData();
      return res;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error actualizando stock del proveedor';
      throw new Error(msg);
    } finally {
      setActionLoading(false);
    }
  };

  return {
    proveedor,
    productos,
    ordenes,
    historial,
    loading,
    error,
    actionLoading,
    handleUpdateStock,
    reload: loadData,
  };
}
