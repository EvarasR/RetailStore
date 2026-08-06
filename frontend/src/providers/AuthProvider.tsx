import React, { createContext, useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getJSON, postJSON } from '../api/http';
import type { SessionState } from '../types/user.types';

export interface AuthContextValue extends SessionState {
  initialized: boolean;
  refetch: () => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<SessionState>({
    autenticado: false,
    es_admin: false,
    es_prime: false,
    es_proveedor_externo: false,
    cod_proveedor: null,
    roles: [],
    usuario: null,
    loading: true,
    error: null,
  });

  const [initialized, setInitialized] = useState(false);

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
        es_proveedor_externo: false,
        cod_proveedor: null,
        roles: [],
        usuario: null,
        loading: false,
        error: message,
      });
    } finally {
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  useEffect(() => {
    const handleSessionExpired = () => {
      setSession({
        autenticado: false,
        es_admin: false,
        es_prime: false,
        es_proveedor_externo: false,
        cod_proveedor: null,
        roles: [],
        usuario: null,
        loading: false,
        error: 'Sesión caducada',
      });
    };

    window.addEventListener('session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('session_expired', handleSessionExpired);
    };
  }, []);

  const logout = async () => {
    try {
      await postJSON('/api/auth/logout/', {});
    } catch {
      // Ignorar el error, limpiaremos localmente de todos modos
    } finally {
      setSession({
        autenticado: false,
        es_admin: false,
        es_prime: false,
        es_proveedor_externo: false,
        cod_proveedor: null,
        roles: [],
        usuario: null,
        loading: false,
        error: null,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ ...session, initialized, refetch: fetchSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
