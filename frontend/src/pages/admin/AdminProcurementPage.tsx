import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminModuleHeader } from '../../components/admin/AdminModuleHeader';
import { AdminProcurementPanel } from '../../components/admin/AdminProcurementPanel';
import { useAdminProcurement } from '../../hooks/useAdminProcurement';

export const AdminProcurementPage: React.FC = () => {
  const { orders, loading, error, actionLoading, handleAction, reload } = useAdminProcurement();
  const [msg, setMsg] = useState<string | null>(null);

  const onAction = async (cod_orden: number, accion: 'recibir' | 'cancelar', observacion?: string) => {
    setMsg(null);
    const res = await handleAction(cod_orden, accion, observacion);
    if (res && 'mensaje' in res && typeof res.mensaje === 'string') {
      setMsg(res.mensaje);
    }
    return res;
  };

  return (
    <AdminLayout title="Abastecimiento Logístico">
      <div className="admin-page">
        <AdminModuleHeader
          title="Gestión de Abastecimiento Logístico"
          subtitle="Órdenes de compra, reposición de almacén y recepción física conectadas con BD."
          onReload={reload}
          loading={loading}
        />

        {msg ? (
          <div className="admin-alert admin-alert-success" style={{ marginBottom: '1.5rem' }}>
            {msg}
          </div>
        ) : null}

        {error ? (
          <div className="admin-alert admin-alert-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        ) : null}

        <AdminProcurementPanel
          orders={orders}
          loading={loading}
          actionLoading={actionLoading}
          onAction={onAction}
        />
      </div>
    </AdminLayout>
  );
};
