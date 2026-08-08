import { useState, useEffect, useCallback } from 'react';
import { fetchAdminPromotions } from '../api/adminPromotions.api';
import type { AdminPromotionsResponse } from '../types/adminPromotion.types';

export function useAdminPromotions() {
  const [data, setData] = useState<AdminPromotionsResponse>({ promociones: [], productos: [], categorias: [], asociaciones: [], asociaciones_categorias: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPromotions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setData(await fetchAdminPromotions());
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar promociones asociadas en BD.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPromotions();
  }, [loadPromotions]);

  return { data, loading, error, reload: loadPromotions };
}
