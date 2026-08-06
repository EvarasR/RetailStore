import { useState, useEffect, useCallback } from 'react';
import {
  fetchMyOrders,
  fetchOrderDetail,
  fetchOrderTracking,
  cancelOrder as apiCancelOrder,
  requestOrderReturn as apiRequestOrderReturn,
} from '../api/orders.api';
import type { OrderSummaryItem, OrderDetailResponse, OrderTrackingResponse } from '../types/order.types';
import { useAuth } from './useAuth';

export function useOrders() {
  const { autenticado: isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<OrderSummaryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setOrders([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMyOrders();
      setOrders(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar historial de pedidos.';
      setError(msg);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const getOrderDetail = useCallback(async (cod_pedido: number | string): Promise<OrderDetailResponse> => {
    return fetchOrderDetail(cod_pedido);
  }, []);

  const getOrderTracking = useCallback(async (cod_pedido: number | string): Promise<OrderTrackingResponse> => {
    return fetchOrderTracking(cod_pedido);
  }, []);

  const cancelOrder = async (cod_pedido: number | string, motivo: string) => {
    const res = await apiCancelOrder(cod_pedido, motivo);
    await loadOrders();
    return res;
  };

  const requestOrderReturn = async (cod_pedido: number | string, motivo: string, descripcion?: string) => {
    const res = await apiRequestOrderReturn(cod_pedido, motivo, descripcion);
    await loadOrders();
    return res;
  };

  return {
    orders,
    loading,
    error,
    getOrderDetail,
    getOrderTracking,
    cancelOrder,
    requestOrderReturn,
    refreshOrders: loadOrders,
  };
}
