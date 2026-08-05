import { useState, useEffect, useCallback } from 'react';
import { fetchAdminPromotions } from '../api/adminPromotions.api';
import type { AdminPromotionAssociation } from '../types/adminPromotion.types';

export function useAdminPromotions() {
  const [associations, setAssociations] = useState<AdminPromotionAssociation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPromotions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminPromotions();
      setAssociations(data.asociaciones || []);
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

  return { associations, loading, error, reload: loadPromotions };
}
