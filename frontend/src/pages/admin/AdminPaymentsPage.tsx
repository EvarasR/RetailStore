import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminModuleHeader } from '../../components/admin/AdminModuleHeader';
import { AdminPaymentsTable } from '../../components/admin/AdminPaymentsTable';
import { AdminFallbackCard } from '../../components/admin/AdminFallbackCard';
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
          subtitle="Monitoreo ejecutivo de transacciones, autorizaciones, facturas SRI y devoluciones en DB."
          onReload={reload}
          loading={loading}
          classicPath="/panel/pagos/"
        />

        <AdminFallbackCard
          title="¿Necesitas conciliar saldos o emitir una nota fiscal manual?"
          description="Las operaciones contables avanzadas y los reportes impositivos del SRI se realizan a través del panel financiero clásico."
          classicPath="/panel/pagos/"
          actionText="Finanzas y Pagos (Panel Clásico)"
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
