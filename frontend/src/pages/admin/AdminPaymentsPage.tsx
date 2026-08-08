import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminModuleHeader } from '../../components/admin/AdminModuleHeader';
import { AdminPaymentsTable } from '../../components/admin/AdminPaymentsTable';
import { useAdminPayments } from '../../hooks/useAdminPayments';

export const AdminPaymentsPage: React.FC = () => {
  const {
    transacciones,
    autorizaciones,
    reembolsos,
    facturas,
    devoluciones,
    loading,
    error,
    reload,
  } = useAdminPayments();

  return (
    <AdminLayout title="Centro Contable y Pagos">
      <div className="admin-page">
        <AdminModuleHeader
          title="Centro Contable y Gestión de Pagos"
          subtitle="Monitoreo de transacciones, comprobantes TechTail y devoluciones con valores oficiales de PostgreSQL."
          onReload={reload}
          loading={loading}
        />

        {error ? (
          <div className="admin-alert admin-alert-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        ) : null}

        <AdminPaymentsTable
          transacciones={transacciones}
          autorizaciones={autorizaciones}
          reembolsos={reembolsos}
          facturas={facturas}
          devoluciones={devoluciones}
          loading={loading}
        />
      </div>
    </AdminLayout>
  );
};
