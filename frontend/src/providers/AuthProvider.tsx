import React, { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { getJSON, postJSON } from '../api/http';
import type { SessionState } from '../types/user.types';
import { AuthContext } from '../contexts/AuthContext';

let pendingSessionRequest: Promise<Omit<SessionState, 'loading' | 'error'>> | null = null;

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

  const requestSession = async (force = false): Promise<Omit<SessionState, 'loading' | 'error'>> => {
    if (!force && pendingSessionRequest) {
      return pendingSessionRequest;
    }

    pendingSessionRequest = getJSON<Omit<SessionState, 'loading' | 'error'>>('/api/session/').finally(() => {
      pendingSessionRequest = null;
    });

    return pendingSessionRequest;
  };

  const refreshSession = useCallback(async (force = false): Promise<SessionState> => {
    try {
      setSession((prev) => ({ ...prev, loading: true, error: null }));
      const data = await requestSession(force);
      const newSession = {
        ...data,
        loading: false,
        error: null,
      };
      setSession(newSession);
      return newSession as SessionState;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo consultar la sesión';
      const failedSession = {
        autenticado: false,
        es_admin: false,
        es_prime: false,
        es_proveedor_externo: false,
        cod_proveedor: null,
        roles: [],
        usuario: null,
        loading: false,
        error: message,
      };
      setSession(failedSession);
      return failedSession;
    } finally {
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    refreshSession().then(() => {
      if (!mounted) return;
    });
    return () => {
      mounted = false;
    };
  }, [refreshSession]);

  const expireSession = useCallback(() => {
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
  }, []);

  const login = async (credentials: Record<string, unknown>): Promise<SessionState> => {
    // 1. Asegurar CSRF (http.ts ya lo hace si es un POST a /api/auth/login/)
    // 2. Ejecutar login
    await postJSON('/api/auth/login/', credentials, { skipSessionExpiredHandling: true });
    // 3. Refrescar sesión (force=true) y retornar
    return await refreshSession(true);
  };

  const logout = async () => {
    try {
      await postJSON('/api/auth/logout/', {});
    } catch {
      // Ignorar el error
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
    <AuthContext.Provider value={{ ...session, initialized, refreshSession, login, logout, expireSession }}>
      {children}
    </AuthContext.Provider>
  );
};
