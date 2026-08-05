import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminModuleHeader } from '../../components/admin/AdminModuleHeader';
import { AdminReportsPanel } from '../../components/admin/AdminReportsPanel';
import { AdminFallbackCard } from '../../components/admin/AdminFallbackCard';
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
          classicPath="/panel/reportes/"
        />

        <AdminFallbackCard
          title="¿Deseas exportar reportes XLS/PDF o consultar balances contables complejos?"
          description="Los exportadores y filtros avanzados por sucursales y cajas están disponibles en el centro de reportes clásico."
          classicPath="/panel/reportes/"
          actionText="Centro de Reportes (Panel Clásico)"
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
