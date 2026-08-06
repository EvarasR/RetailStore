import { useState, useEffect, useCallback } from 'react';
import { fetchWishlist, toggleWishlist as apiToggleWishlist } from '../api/wishlist.api';
import type { ProductItem } from '../api/products.api';
import { useAuth } from './useAuth';

export function useWishlist() {
  const { autenticado: isAuthenticated, loading: authLoading } = useAuth();
  const [wishlist, setWishlist] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadWishlist = useCallback(async () => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setWishlist([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await fetchWishlist();
      setWishlist(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar favoritos.';
      setError(msg);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    loadWishlist();
  }, [loadWishlist]);

  const toggleFavorite = async (cod_producto: number | string) => {
    const res = await apiToggleWishlist(cod_producto);
    await loadWishlist();
    return res;
  };

  return {
    wishlist,
    loading,
    error,
    toggleFavorite,
    refreshWishlist: loadWishlist,
  };
}
