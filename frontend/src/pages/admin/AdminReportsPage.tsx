import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminModuleHeader } from '../../components/admin/AdminModuleHeader';
import { AdminReportsPanel } from '../../components/admin/AdminReportsPanel';
import { useAdminReports } from '../../hooks/useAdminReports';

export const AdminReportsPage: React.FC = () => {
  const { ventas, loading, error, reload } = useAdminReports();

  return (
    <AdminLayout title="Reportes de Ventas">
      <div className="admin-page">
        <AdminModuleHeader
          title="Inteligencia Comercial y Reportes de Ventas"
          subtitle="Análisis de rendimiento diario, volumen de transacciones y ticket promedio calculado por el motor fiscal."
          onReload={reload}
          loading={loading}
        />

        {error ? (
          <div className="admin-alert admin-alert-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        ) : null}

        <AdminReportsPanel ventas={ventas} loading={loading} />
      </div>
    </AdminLayout>
  );
};
