import { useState, useEffect, useCallback } from 'react';
import {
  fetchAdminOrders,
  fetchAdminOrderDetail,
  changeAdminOrderStatus,
} from '../api/adminOrders.api';
import type {
  AdminOrderItem,
  AdminOrderStatusOption,
  AdminOrderDetailResponse,
} from '../types/adminOrder.types';

export function useAdminOrders() {
  const [orders, setOrders] = useState<AdminOrderItem[]>([]);
  const [statusOptions, setStatusOptions] = useState<AdminOrderStatusOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [estadoFilter, setEstadoFilter] = useState('');

  const [selectedDetail, setSelectedDetail] = useState<AdminOrderDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const loadOrders = useCallback(async (searchEstado = estadoFilter) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminOrders(searchEstado);
      setOrders(data.pedidos || []);
      setStatusOptions(data.estados || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar listado oficial de pedidos.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [estadoFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const openOrderDetail = async (cod_pedido: number | string) => {
    setDetailLoading(true);
    setDetailError(null);
    setSelectedDetail(null);
    try {
      const data = await fetchAdminOrderDetail(cod_pedido);
      setSelectedDetail(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo cargar el detalle del pedido.';
      setDetailError(msg);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeOrderDetail = () => {
    setSelectedDetail(null);
    setDetailError(null);
  };

  const handleStatusChange = async (
    cod_pedido: number | string,
    nuevoEstado: string,
    comentario?: string
  ) => {
    const res = await changeAdminOrderStatus(cod_pedido, nuevoEstado, comentario);
    await loadOrders(estadoFilter);
    if (selectedDetail && String(selectedDetail.pedido.cod_pedido) === String(cod_pedido)) {
      await openOrderDetail(cod_pedido);
    }
    return res;
  };

  return {
    orders,
    statusOptions,
    loading,
    error,
    estadoFilter,
    setEstadoFilter,
    selectedDetail,
    detailLoading,
    detailError,
    openOrderDetail,
    closeOrderDetail,
    handleStatusChange,
    refresh: () => loadOrders(estadoFilter),
  };
}
