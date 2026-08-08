import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminModuleHeader } from '../../components/admin/AdminModuleHeader';
import { AdminControlPanel } from '../../components/admin/AdminControlPanel';
import { useAdminControl } from '../../hooks/useAdminControl';
import { AdminMutationForm } from '../../components/admin/AdminMutationForm';

export const AdminControlPage: React.FC = () => {
  const {
    modulo,
    usuarios,
    roles,
    permisos,
    registros,
    carritos,
    loading,
    error,
    changeModule,
    reload,
    runAction,
  } = useAdminControl();

  return (
    <AdminLayout title="Control y Seguridad">
      <div className="admin-page">
        <AdminModuleHeader
          title="Control Empresarial, Seguridad y Auditoría"
          subtitle="Directorio corporativo de usuarios, roles de seguridad y logs de auditoría oficiales en PostgreSQL."
          onReload={reload}
          loading={loading}
        />

        {modulo === 'usuarios' && (
          <div className="admin-control-actions">
            <AdminMutationForm
              title="Crear usuario" description="Crea una cuenta con trazabilidad y asigna uno de los roles oficiales." submitLabel="Crear usuario"
              fields={[
                { name: 'email', label: 'Email', type: 'email', required: true }, { name: 'password', label: 'Contraseña temporal', required: true },
                { name: 'nombres', label: 'Nombres', required: true }, { name: 'apellidos', label: 'Apellidos', required: true },
                { name: 'telefono', label: 'Teléfono' },
                { name: 'rol', label: 'Rol oficial', type: 'select', defaultValue: 'CUSTOMER', options: ['CUSTOMER', 'PREMIUM_CUSTOMER', 'ADMIN', 'WAREHOUSE_MANAGER', 'SUPPLIER_MANAGER', 'SUPPORT'].map((value) => ({ value, label: value })) },
              ]}
              onSubmit={(values) => runAction({ accion: 'crear_usuario', ...values })}
            />
            <AdminMutationForm
              title="Roles de usuario" description="Asigna o retira roles oficiales existentes." submitLabel="Actualizar roles"
              fields={[
                { name: 'cod_usuario', label: 'ID usuario', type: 'number', required: true },
                { name: 'accion', label: 'Acción', type: 'select', required: true, options: [{ value: 'asignar_rol', label: 'Asignar rol' }, { value: 'quitar_rol', label: 'Quitar rol' }] },
                { name: 'rol', label: 'Rol', type: 'select', required: true, options: roles.filter((role) => role.nombre !== 'PROVEEDOR').map((role) => ({ value: role.nombre, label: role.nombre })) },
              ]}
              onSubmit={runAction}
            />
            <AdminMutationForm
              title="Estado de usuario" description="Desactiva o reactiva una cuenta; el backend impide la autodesactivación administrativa." submitLabel="Actualizar estado"
              fields={[
                { name: 'cod_usuario', label: 'ID usuario', type: 'number', required: true },
                { name: 'accion', label: 'Acción', type: 'select', required: true, options: [{ value: 'desactivar_usuario', label: 'Desactivar' }, { value: 'reactivar_usuario', label: 'Reactivar' }] },
              ]}
              onSubmit={runAction}
            />
            <AdminMutationForm
              title="Crear permiso" description="Registra un permiso granular en el catálogo de seguridad." submitLabel="Crear permiso"
              fields={[{ name: 'codigo', label: 'Código', required: true }, { name: 'nombre', label: 'Nombre', required: true }, { name: 'descripcion', label: 'Descripción', type: 'textarea' }]}
              onSubmit={(values) => runAction({ accion: 'crear_permiso', ...values })}
            />
            <AdminMutationForm
              title="Permisos de rol" description="Asigna o revoca un permiso existente a un rol." submitLabel="Actualizar permisos"
              fields={[
                { name: 'cod_rol', label: 'Rol', type: 'select', required: true, options: roles.map((role) => ({ value: String(role.cod_rol), label: role.nombre })) },
                { name: 'cod_permiso', label: 'Permiso', type: 'select', required: true, options: permisos.map((permission) => ({ value: String(permission.cod_permiso), label: `${permission.codigo} · ${permission.nombre}` })) },
                { name: 'accion', label: 'Acción', type: 'select', required: true, options: [{ value: 'asignar_permiso', label: 'Asignar' }, { value: 'revocar_permiso', label: 'Revocar' }] },
              ]}
              onSubmit={runAction}
            />
          </div>
        )}

        {error ? (
          <div className="admin-alert admin-alert-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        ) : null}

        <AdminControlPanel
          modulo={modulo}
          usuarios={usuarios}
          roles={roles}
          registros={registros}
          carritos={carritos}
          loading={loading}
          onChangeModule={changeModule}
        />
      </div>
    </AdminLayout>
  );
};
