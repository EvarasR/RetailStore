import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminModuleHeader } from '../../components/admin/AdminModuleHeader';
import { AdminTrackingTimeline } from '../../components/admin/AdminTrackingTimeline';
import { AdminFallbackCard } from '../../components/admin/AdminFallbackCard';
import { useAdminTracking } from '../../hooks/useAdminTracking';

export const AdminTrackingPage: React.FC = () => {
  const {
    envios,
    programaciones,
    loading,
    error,
    actionLoading,
    handleProcessPending,
    reload,
  } = useAdminTracking();
  const [msg, setMsg] = useState<string | null>(null);

  const onProcessPending = async () => {
    setMsg(null);
    const res = await handleProcessPending();
    if (res && 'mensaje' in res && typeof res.mensaje === 'string') {
      setMsg(res.mensaje);
    }
    return res;
  };

  return (
    <AdminLayout title="Monitoreo Logístico">
      <div className="admin-page">
        <AdminModuleHeader
          title="Monitoreo Logístico y Tracking Operativo"
          subtitle="Envíos registrados, guías de transporte e hitos logísticos oficiales de PostgreSQL."
          onReload={reload}
          loading={loading}
          classicPath="/panel/tracking/"
        />

        <AdminFallbackCard
          title="¿Deseas asignar un transportista o generar guías de despacho manuales?"
          description="El despacho avanzado con guías de transporte e impresión térmica está disponible en el módulo clásico de logística."
          classicPath="/panel/tracking/"
          actionText="Centro Logístico (Panel Clásico)"
        />

        {msg ? (
          <div className="admin-alert admin-alert-success" style={{ marginBottom: '1.5rem' }}>
            {msg}
          </div>
        ) : null}

        {error ? (
          <div className="admin-alert admin-alert-error" style={{ marginBottom: '1.5rem' }}>
            {error}
          </div>
        ) : null}

        <AdminTrackingTimeline
          envios={envios}
          programaciones={programaciones}
          loading={loading}
          actionLoading={actionLoading}
          onProcessPending={onProcessPending}
        />
      </div>
    </AdminLayout>
  );
};
