import { useState, useEffect, useCallback } from 'react';
import { fetchAdminPrime } from '../api/adminPrime.api';
import type {
  AdminPrimePlan,
  AdminPrimeBenefit,
  AdminPrimeMembership,
  AdminPrimeUsage,
} from '../types/adminPrime.types';

export function useAdminPrime() {
  const [planes, setPlanes] = useState<AdminPrimePlan[]>([]);
  const [beneficios, setBeneficios] = useState<AdminPrimeBenefit[]>([]);
  const [membresias, setMembresias] = useState<AdminPrimeMembership[]>([]);
  const [usos, setUsos] = useState<AdminPrimeUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPrime = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminPrime();
      setPlanes(data.planes || []);
      setBeneficios(data.beneficios || []);
      setMembresias(data.membresias || []);
      setUsos(data.usos || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar membresías Prime en BD.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPrime();
  }, [loadPrime]);

  return { planes, beneficios, membresias, usos, loading, error, reload: loadPrime };
}
