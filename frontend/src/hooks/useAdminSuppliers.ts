import { useState, useEffect, useCallback } from 'react';
import { fetchAdminSuppliers } from '../api/adminSuppliers.api';
import type { AdminSupplierItem } from '../types/adminSupplier.types';

export function useAdminSuppliers() {
  const [suppliers, setSuppliers] = useState<AdminSupplierItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSuppliers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminSuppliers();
      setSuppliers(data.proveedores || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar proveedores.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  return { suppliers, loading, error, reload: loadSuppliers };
}
