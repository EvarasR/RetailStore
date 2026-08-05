import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminModuleHeader } from '../../components/admin/AdminModuleHeader';
import { AdminPromotionsTable } from '../../components/admin/AdminPromotionsTable';
import { AdminFallbackCard } from '../../components/admin/AdminFallbackCard';
import { useAdminPromotions } from '../../hooks/useAdminPromotions';

export const AdminPromotionsPage: React.FC = () => {
  const { associations, loading, error, reload } = useAdminPromotions();

  return (
    <AdminLayout title="Catálogo de Promociones">
      <div className="admin-page">
        <AdminModuleHeader
          title="Catálogo de Promociones y Campañas"
          subtitle="Monitoreo de promociones asociadas a productos y catálogo activo en BD."
          onReload={reload}
          loading={loading}
          classicPath="/panel/"
        />

        <AdminFallbackCard
          title="¿Deseas dar de alta una nueva campaña de descuento promocional?"
          description="La configuración avanzada de promociones con intervalos de fechas y asociación múltiple se gestiona desde el Panel Clásico."
          classicPath="/panel/"
          actionText="Gestionar Campañas (Panel Clásico)"
        />

        {error ? (
          <div className="admin-alert admin-alert-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        ) : null}

        <AdminPromotionsTable associations={associations} loading={loading} />
      </div>
    </AdminLayout>
  );
};
