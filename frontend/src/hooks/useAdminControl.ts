import { useState, useEffect, useCallback } from 'react';
import { fetchAdminControl } from '../api/adminControl.api';
import type {
  AdminControlUser,
  AdminControlRole,
  AdminControlAuditLog,
  AdminControlAbandonedCart,
} from '../types/adminControl.types';

export function useAdminControl(initialModule = 'usuarios') {
  const [modulo, setModulo] = useState(initialModule);
  const [usuarios, setUsuarios] = useState<AdminControlUser[]>([]);
  const [roles, setRoles] = useState<AdminControlRole[]>([]);
  const [registros, setRegistros] = useState<AdminControlAuditLog[]>([]);
  const [carritos, setCarritos] = useState<AdminControlAbandonedCart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadModule = useCallback(async (targetModule = modulo) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminControl(targetModule);
      if (targetModule === 'usuarios') {
        setUsuarios(data.usuarios || []);
        setRoles(data.roles || []);
      } else if (targetModule === 'auditoria') {
        setRegistros(data.registros || []);
        setCarritos(data.carritos_abandonados || []);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar módulo de control empresarial.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [modulo]);

  useEffect(() => {
    loadModule(modulo);
  }, [loadModule, modulo]);

  const changeModule = (newModule: string) => {
    setModulo(newModule);
  };

  return {
    modulo,
    usuarios,
    roles,
    registros,
    carritos,
    loading,
    error,
    changeModule,
    reload: () => loadModule(modulo),
  };
}
