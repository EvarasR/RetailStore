import { useState, useEffect, useCallback } from 'react';
import { fetchAdminControl, runAdminControlAction } from '../api/adminControl.api';
import type {
  AdminControlUser,
  AdminControlRole,
  AdminControlAuditLog,
  AdminControlAbandonedCart,
  AdminControlPermission,
} from '../types/adminControl.types';

export function useAdminControl(initialModule = 'usuarios') {
  const [modulo, setModulo] = useState(initialModule);
  const [usuarios, setUsuarios] = useState<AdminControlUser[]>([]);
  const [roles, setRoles] = useState<AdminControlRole[]>([]);
  const [permisos, setPermisos] = useState<AdminControlPermission[]>([]);
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
        setPermisos(data.permisos || []);
      } else if (targetModule === 'auditoria') {
        setRegistros(data.registros || (data.auditoria || []).map((item) => ({
          cod_registro: item.cod_auditoria,
          usuario: item.usuario_bd,
          accion: item.operacion,
          modulo: item.tabla,
          ip: '—',
          fecha: item.fecha,
        })));
        setCarritos((data.carritos_abandonados || []).map((item) => ('usuario' in item ? item : {
          cod_carrito: item.cod_carrito,
          usuario: item.cliente,
          valor: item.total,
          items: 0,
          fecha: item.fecha,
        })));
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
    permisos,
    registros,
    carritos,
    loading,
    error,
    changeModule,
    reload: () => loadModule(modulo),
    runAction: async (values: Record<string, unknown>) => {
      const result = await runAdminControlAction(values);
      await loadModule(modulo);
      return result;
    },
  };
}
