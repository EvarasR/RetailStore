import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminModuleHeader } from '../../components/admin/AdminModuleHeader';
import { AdminPrimePanel } from '../../components/admin/AdminPrimePanel';
import { AdminFallbackCard } from '../../components/admin/AdminFallbackCard';
import { useAdminPrime } from '../../hooks/useAdminPrime';

export const AdminPrimePage: React.FC = () => {
  const { planes, beneficios, membresias, usos, loading, error, reload } = useAdminPrime();

  return (
    <AdminLayout title="Membresías Prime">
      <div className="admin-page">
        <AdminModuleHeader
          title="Gestión y Control de Membresías Prime"
          subtitle="Monitoreo de suscripciones activas, planes corporativos y uso de beneficios en BD."
          onReload={reload}
          loading={loading}
          classicPath="/panel/prime/"
        />

        <AdminFallbackCard
          title="¿Necesitas modificar las tarifas o añadir nuevos planes de membresía?"
          description="La edición de reglas de facturación recurrente y parámetros fiscales Prime se encuentra en el Panel Clásico."
          classicPath="/panel/prime/"
          actionText="Administrar Prime (Panel Clásico)"
        />

        {error ? (
          <div className="admin-alert admin-alert-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        ) : null}

        <AdminPrimePanel
          planes={planes}
          beneficios={beneficios}
          membresias={membresias}
          usos={usos}
          loading={loading}
        />
      </div>
    </AdminLayout>
  );
};
