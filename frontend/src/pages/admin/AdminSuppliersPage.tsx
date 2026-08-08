import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminModuleHeader } from '../../components/admin/AdminModuleHeader';
import { AdminSupplierTable } from '../../components/admin/AdminSupplierTable';
import { AdminMutationForm } from '../../components/admin/AdminMutationForm';
import { useAdminSuppliers } from '../../hooks/useAdminSuppliers';
import { createAdminSupplier } from '../../api/adminSuppliers.api';

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
        />

        <AdminMutationForm
          title="Registrar proveedor"
          description="El proveedor externo se vincula por asociación activa; no se crea ningún rol ficticio."
          submitLabel="Registrar proveedor"
          fields={[
            { name: 'ruc', label: 'RUC', required: true },
            { name: 'razon_social', label: 'Razón social', required: true },
            { name: 'nombre_comercial', label: 'Nombre comercial' },
            { name: 'email', label: 'Email', type: 'email', required: true },
            { name: 'telefono', label: 'Teléfono' },
            { name: 'direccion', label: 'Dirección' },
            { name: 'ciudad', label: 'Ciudad' },
            { name: 'provincia', label: 'Provincia' },
          ]}
          onSubmit={createAdminSupplier}
          onSuccess={reload}
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
