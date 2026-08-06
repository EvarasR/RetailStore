import { useState, useEffect, useCallback } from 'react';
import { fetchAdminCoupons } from '../api/adminCoupons.api';
import type { AdminCouponItem, AdminCouponUsage } from '../types/adminCoupon.types';

export function useAdminCoupons() {
  const [coupons, setCoupons] = useState<AdminCouponItem[]>([]);
  const [usage, setUsage] = useState<AdminCouponUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCoupons = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminCoupons();
      setCoupons(data.cupones || []);
      setUsage(data.usos || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar cupones oficiales de BD.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadCoupons();
  }, [loadCoupons]);

  return { coupons, usage, loading, error, reload: loadCoupons };
}
