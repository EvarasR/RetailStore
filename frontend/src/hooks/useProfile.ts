import { useState, useEffect, useCallback } from 'react';
import { fetchProfile, updateProfile as apiUpdateProfile } from '../api/profile.api';
import type { ProfileResponse } from '../types/profile.types';
import { useAuth } from './useAuth';

export function useProfile() {
  const { autenticado: isAuthenticated, loading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setProfileData(null);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await fetchProfile();
      setProfileData(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar perfil corporativo.';
      setError(msg);
      setProfileData(null);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const updateProfile = async (formData: Record<string, string>) => {
    const res = await apiUpdateProfile(formData);
    await loadProfile();
    return res;
  };

  return {
    profileData,
    loading,
    error,
    updateProfile,
    refreshProfile: loadProfile,
  };
}
