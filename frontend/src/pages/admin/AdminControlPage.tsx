import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminModuleHeader } from '../../components/admin/AdminModuleHeader';
import { AdminControlPanel } from '../../components/admin/AdminControlPanel';
import { AdminFallbackCard } from '../../components/admin/AdminFallbackCard';
import { useAdminControl } from '../../hooks/useAdminControl';

export const AdminControlPage: React.FC = () => {
  const {
    modulo,
    usuarios,
    roles,
    registros,
    carritos,
    loading,
    error,
    changeModule,
    reload,
  } = useAdminControl();

  return (
    <AdminLayout title="Control y Seguridad">
      <div className="admin-page">
        <AdminModuleHeader
          title="Control Empresarial, Seguridad y Auditoría"
          subtitle="Directorio corporativo de usuarios, roles de seguridad y logs de auditoría oficiales en PostgreSQL."
          onReload={reload}
          loading={loading}
          classicPath="/panel/control/"
        />

        <AdminFallbackCard
          title="¿Necesitas asignar permisos avanzados o modificar parámetros del sistema?"
          description="La configuración profunda granular por permisos y parámetros organizacionales reside en el Panel Clásico de Control."
          classicPath="/panel/control/"
          actionText="Control Empresarial (Panel Clásico)"
        />

        {error ? (
          <div className="admin-alert admin-alert-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        ) : null}

        <AdminControlPanel
          modulo={modulo}
          usuarios={usuarios}
          roles={roles}
          registros={registros}
          carritos={carritos}
          loading={loading}
          onChangeModule={changeModule}
        />
      </div>
    </AdminLayout>
  );
};
