import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminModuleHeader } from '../../components/admin/AdminModuleHeader';
import { AdminPromotionsTable } from '../../components/admin/AdminPromotionsTable';
import { AdminMutationForm } from '../../components/admin/AdminMutationForm';
import { useAdminPromotions } from '../../hooks/useAdminPromotions';
import { createAdminPromotion, associateAdminPromotionProduct } from '../../api/adminPromotions.api';

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
        />

        <AdminMutationForm
          title="Crear promoción"
          description="Las fechas y el valor se registran mediante el contrato administrativo DB-First."
          submitLabel="Crear promoción"
          fields={[
            { name: 'codigo', label: 'Código', required: true },
            { name: 'nombre', label: 'Nombre', required: true },
            { name: 'tipo_descuento', label: 'Tipo', type: 'select', required: true, options: [{ value: 'PORCENTAJE', label: 'Porcentaje' }, { value: 'MONTO_FIJO', label: 'Monto fijo' }] },
            { name: 'valor', label: 'Valor', type: 'number', required: true },
            { name: 'fecha_inicio', label: 'Inicio', type: 'date', required: true },
            { name: 'fecha_fin', label: 'Fin', type: 'date', required: true },
            { name: 'descripcion', label: 'Descripción', type: 'textarea' },
            { name: 'acumulable', label: 'Acumulable', type: 'checkbox' },
          ]}
          onSubmit={createAdminPromotion}
          onSuccess={reload}
        />

        <AdminMutationForm
          title="Asociar producto"
          description="Asocia o retira un producto de una promoción existente."
          submitLabel="Guardar asociación"
          fields={[
            { name: 'cod_promocion', label: 'ID promoción', type: 'number', required: true },
            { name: 'cod_producto', label: 'ID producto', type: 'number', required: true },
            { name: 'desasociar', label: 'Retirar asociación', type: 'checkbox' },
          ]}
          onSubmit={(values) => associateAdminPromotionProduct(Number(values.cod_promocion), values)}
          onSuccess={reload}
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
