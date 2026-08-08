import React, { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminInventoryTable } from '../../components/admin/AdminInventoryTable';
import { AdminInventoryAlerts } from '../../components/admin/AdminInventoryAlerts';
import { useAdminInventory } from '../../hooks/useAdminInventory';

export const AdminInventoryPage: React.FC = () => {
  const { inventory, lotes, alerts, loading, error, refresh, handleAction } =
    useAdminInventory();
  const [activeTab, setActiveTab] = useState<'stock' | 'lotes'>('stock');

  const handleResolveAlert = async (cod_alerta: number) => {
    await handleAction({
      accion: 'resolver_alerta',
      cod_alerta,
      observacion: 'Resuelta desde Panel React de Inventario',
    });
  };

  return (
    <AdminLayout title="Control Corporativo de Inventario y Lotes">
      <div className="admin-table-container" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-table-toolbar">
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.875rem', color: 'var(--tt-color-text-light)' }}>
              Almacenes oficiales conectados en tiempo real con PostgreSQL
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={refresh}
              style={{
                padding: '0.5rem 0.85rem',
                background: 'rgba(255,255,255,0.05)',
                color: 'var(--tt-color-text-muted)',
                border: '1px solid var(--tt-color-border)',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}
            >
              <RefreshCw size={14} />
              <span>Sincronizar</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div
          style={{
            padding: '1rem',
            background: 'rgba(239, 68, 68, 0.15)',
            color: 'var(--tt-color-error)',
            borderRadius: '0.5rem',
            marginBottom: '1.5rem',
          }}
        >
          {error}
        </div>
      )}

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: 'var(--tt-color-text-light)' }}>
          Consultando stock y alertas oficiales de bodega...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* SECCIÓN 1: ALERTAS CRÍTICAS DE STOCK */}
          <div>
            <h3
              style={{
                margin: '0 0 1rem 0',
                fontSize: '1rem',
                color: 'var(--tt-color-text-main)',
                textTransform: 'uppercase',
              }}
            >
              Alertas del Sistema de Abastecimiento ({alerts.filter((a) => !a.atendida).length}{' '}
              pendientes)
            </h3>
            <AdminInventoryAlerts alerts={alerts} onResolve={handleResolveAlert} />
          </div>

          {/* SECCIÓN 2: TABLA PRINCIPAL DE INVENTARIO Y LOTES */}
          <div>
            <AdminInventoryTable
              inventory={inventory}
              lotes={lotes}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
