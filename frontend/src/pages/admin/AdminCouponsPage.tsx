import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminModuleHeader } from '../../components/admin/AdminModuleHeader';
import { AdminCouponsTable } from '../../components/admin/AdminCouponsTable';
import { AdminFallbackCard } from '../../components/admin/AdminFallbackCard';
import { useAdminCoupons } from '../../hooks/useAdminCoupons';

export const AdminCouponsPage: React.FC = () => {
  const { coupons, usage, loading, error, reload } = useAdminCoupons();

  return (
    <AdminLayout title="Cupones y Descuentos">
      <div className="admin-page">
        <AdminModuleHeader
          title="Gestión de Cupones y Descuentos"
          subtitle="Monitoreo oficial de códigos promocionales, límites y auditoría de uso en PostgreSQL."
          onReload={reload}
          loading={loading}
          classicPath="/panel/"
        />

        <AdminFallbackCard
          title="¿Necesitas crear un nuevo cupón o ajustar límites de uso?"
          description="La creación de cupones con reglas por monto mínimo y vigencia está centralizada en el Panel Clásico de Marketing."
          classicPath="/panel/"
          actionText="Crear Cupón (Panel Clásico)"
        />

        {error ? (
          <div className="admin-alert admin-alert-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        ) : null}

        <AdminCouponsTable coupons={coupons} usage={usage} loading={loading} />
      </div>
    </AdminLayout>
  );
};
