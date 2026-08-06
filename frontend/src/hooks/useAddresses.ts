import { useState, useEffect, useCallback } from 'react';
import {
  fetchAddresses,
  fetchLocations,
  createAddress as apiCreateAddress,
  updateAddress as apiUpdateAddress,
  deleteAddress as apiDeleteAddress,
} from '../api/addresses.api';
import type { Address, UbicacionesData } from '../types/address.types';
import { useAuth } from './useAuth';

export function useAddresses() {
  const { autenticado: isAuthenticated, loading: authLoading } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [locations, setLocations] = useState<UbicacionesData | null>(null);

  const loadAddresses = useCallback(async () => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setAddresses([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await fetchAddresses();
      setAddresses(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar direcciones';
      setError(msg);
      setAddresses([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    loadAddresses();
  }, [loadAddresses]);

  const loadLocations = useCallback(async (cod_provincia?: string | number) => {
    try {
      const data = await fetchLocations(cod_provincia);
      setLocations(data);
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar provincias y cantones';
      setError(msg);
      throw err;
    }
  }, []);

  const createAddress = async (data: Record<string, string | number | boolean>) => {
    const res = await apiCreateAddress(data);
    await loadAddresses();
    return res;
  };

  const updateAddress = async (cod_direccion: number, data: Record<string, string | number | boolean>) => {
    const res = await apiUpdateAddress(cod_direccion, data);
    await loadAddresses();
    return res;
  };

  const deleteAddress = async (cod_direccion: number) => {
    const res = await apiDeleteAddress(cod_direccion);
    await loadAddresses();
    return res;
  };

  return {
    addresses,
    loading,
    error,
    locations,
    loadLocations,
    createAddress,
    updateAddress,
    deleteAddress,
    refreshAddresses: loadAddresses,
  };
}
