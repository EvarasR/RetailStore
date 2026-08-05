import { useState, useEffect, useCallback } from 'react';
import { getJSON, postJSON } from '../api/http';
import type { SessionState } from '../types/user.types';

export function useAuth() {
  const [session, setSession] = useState<SessionState>({
    autenticado: false,
    es_admin: false,
    es_prime: false,
    roles: [],
    usuario: null,
    loading: true,
    error: null,
  });

  const fetchSession = useCallback(async () => {
    try {
      setSession((prev) => ({ ...prev, loading: true, error: null }));
      const data = await getJSON<Omit<SessionState, 'loading' | 'error'>>('/api/session/');
      setSession({
        ...data,
        loading: false,
        error: null,
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo consultar la sesión';
      setSession({
        autenticado: false,
        es_admin: false,
        es_prime: false,
        roles: [],
        usuario: null,
        loading: false,
        error: message,
      });
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const logout = async () => {
    try {
      await postJSON('/api/auth/logout/', {});
      await fetchSession();
    } catch {
      // Si el endpoint fallase por cualquier motivo, recargamos hacia la ruta clásica
      window.location.href = '/logout/';
    }
  };

  return {
    ...session,
    refetch: fetchSession,
    logout,
  };
}
