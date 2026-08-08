import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminModuleHeader } from '../../components/admin/AdminModuleHeader';
import { AdminCouponsTable } from '../../components/admin/AdminCouponsTable';
import { AdminMutationForm } from '../../components/admin/AdminMutationForm';
import { useAdminCoupons } from '../../hooks/useAdminCoupons';
import { createAdminCoupon } from '../../api/adminCoupons.api';

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
        />

        <AdminMutationForm
          title="Crear cupón"
          description="PostgreSQL valida la vigencia, los límites y el descuento oficial."
          submitLabel="Crear cupón"
          fields={[
            { name: 'codigo', label: 'Código', required: true },
            { name: 'nombre', label: 'Nombre', required: true },
            { name: 'tipo_descuento', label: 'Tipo', type: 'select', required: true, options: [{ value: 'PORCENTAJE', label: 'Porcentaje' }, { value: 'MONTO_FIJO', label: 'Monto fijo' }] },
            { name: 'valor', label: 'Valor', type: 'number', required: true },
            { name: 'monto_minimo', label: 'Monto mínimo', type: 'number', defaultValue: '0' },
            { name: 'usos_maximos', label: 'Usos máximos', type: 'number' },
            { name: 'usos_por_usuario', label: 'Usos por cliente', type: 'number', defaultValue: '1' },
            { name: 'dias_vigencia', label: 'Días de vigencia', type: 'number', defaultValue: '30' },
            { name: 'descripcion', label: 'Descripción', type: 'textarea' },
          ]}
          onSubmit={createAdminCoupon}
          onSuccess={reload}
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
