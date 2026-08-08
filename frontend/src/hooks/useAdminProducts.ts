import { useState, useEffect, useCallback } from 'react';
import {
  fetchAdminProducts,
  publishAdminProduct,
  pauseAdminProduct,
  deactivateAdminProduct,
} from '../api/adminProducts.api';
import type { AdminProductItem } from '../types/adminProduct.types';

export function useAdminProducts() {
  const [products, setProducts] = useState<AdminProductItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [q, setQ] = useState('');
  const [estado, setEstado] = useState('');
  const [categoria, setCategoria] = useState('');
  const [proveedor, setProveedor] = useState('');

  const loadProducts = useCallback(async (searchQuery = q, searchEstado = estado) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminProducts(searchQuery, searchEstado, categoria, proveedor);
      setProducts(data.productos || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar productos administrativos.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [q, estado, categoria, proveedor]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handlePublish = async (cod_producto: number) => {
    setActionLoading(cod_producto);
    try {
      const res = await publishAdminProduct(cod_producto);
      await loadProducts();
      return res;
    } finally {
      setActionLoading(null);
    }
  };

  const handlePause = async (cod_producto: number) => {
    setActionLoading(cod_producto);
    try {
      const res = await pauseAdminProduct(cod_producto);
      await loadProducts();
      return res;
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (cod_producto: number) => {
    setActionLoading(cod_producto);
    try {
      const res = await deactivateAdminProduct(cod_producto);
      await loadProducts();
      return res;
    } finally {
      setActionLoading(null);
    }
  };

  return {
    products,
    loading,
    error,
    actionLoading,
    q,
    setQ,
    estado,
    setEstado,
    categoria,
    setCategoria,
    proveedor,
    setProveedor,
    refresh: () => loadProducts(q, estado),
    handlePublish,
    handlePause,
    handleDeactivate,
  };
}
