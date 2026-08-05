import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminModuleHeader } from '../../components/admin/AdminModuleHeader';
import { AdminSupplierTable } from '../../components/admin/AdminSupplierTable';
import { AdminFallbackCard } from '../../components/admin/AdminFallbackCard';
import { useAdminSuppliers } from '../../hooks/useAdminSuppliers';

export const AdminSuppliersPage: React.FC = () => {
  const { suppliers, loading, error, reload } = useAdminSuppliers();

  return (
    <AdminLayout title="Gestión de Proveedores">
      <div className="admin-page">
        <AdminModuleHeader
          title="Directorio y Gestión de Proveedores"
          subtitle="Monitoreo de socios de negocio, RUC, calificaciones y contactos en PostgreSQL."
          onReload={reload}
          loading={loading}
          classicPath="/panel/proveedores/"
        />

        <AdminFallbackCard
          title="¿Necesitas registrar un nuevo proveedor o editar contactos corporativos?"
          description="El alta administrativa y la gestión avanzada de proveedores y usuarios asociados está disponible desde el Panel Clásico de Django."
          classicPath="/panel/proveedores/"
          actionText="Administrar Proveedores (Panel Clásico)"
        />

        {error ? (
          <div className="admin-alert admin-alert-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        ) : null}

        <AdminSupplierTable suppliers={suppliers} loading={loading} />
      </div>
    </AdminLayout>
  );
};
