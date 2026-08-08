import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminModuleHeader } from '../../components/admin/AdminModuleHeader';
import { AdminPrimePanel } from '../../components/admin/AdminPrimePanel';
import { AdminMutationForm } from '../../components/admin/AdminMutationForm';
import { useAdminPrime } from '../../hooks/useAdminPrime';
import { runAdminPrimeAction, createAdminPrimeBenefit } from '../../api/adminPrime.api';

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
        />

        <AdminMutationForm
          title="Crear plan Prime"
          description="El precio y la duración se guardan en PostgreSQL; React no deriva beneficios."
          submitLabel="Crear plan"
          fields={[
            { name: 'nombre', label: 'Nombre', required: true },
            { name: 'precio', label: 'Precio', type: 'number', required: true },
            { name: 'duracion', label: 'Duración en días', type: 'number', required: true },
          ]}
          onSubmit={(values) => runAdminPrimeAction({ accion: 'crear_plan_prime', ...values })}
          onSuccess={reload}
        />

        <AdminMutationForm
          title="Crear beneficio Prime"
          description="Registra un beneficio oficial asociado a un plan existente."
          submitLabel="Crear beneficio"
          fields={[
            { name: 'cod_plan', label: 'ID plan', type: 'number', required: true },
            { name: 'codigo', label: 'Código', required: true },
            { name: 'nombre', label: 'Nombre', required: true },
            { name: 'valor', label: 'Valor', type: 'number' },
            { name: 'descripcion', label: 'Descripción', type: 'textarea' },
          ]}
          onSubmit={createAdminPrimeBenefit}
          onSuccess={reload}
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
