import React from 'react';
import { RefreshCw, Filter } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminOrdersTable } from '../../components/admin/AdminOrdersTable';
import { AdminOrderDrawer } from '../../components/admin/AdminOrderDrawer';
import { AdminEmptyState } from '../../components/admin/AdminEmptyState';
import { useAdminOrders } from '../../hooks/useAdminOrders';

export const AdminOrdersPage: React.FC = () => {
  const {
    orders,
    statusOptions,
    loading,
    error,
    estadoFilter,
    setEstadoFilter,
    selectedDetail,
    detailLoading,
    detailError,
    openOrderDetail,
    closeOrderDetail,
    handleStatusChange,
    refresh,
  } = useAdminOrders();

  return (
    <AdminLayout title="Gestión Operativa de Pedidos">
      <div className="admin-table-container" style={{ marginBottom: '1.5rem' }}>
        <div className="admin-table-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <Filter size={16} className="text-slate-400" />
            <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>Estado:</span>
            <select
              value={estadoFilter}
              onChange={(e) => setEstadoFilter(e.target.value)}
              style={{
                padding: '0.45rem 0.75rem',
                backgroundColor: 'var(--tt-color-surface)',
                color: 'var(--tt-color-text-main)',
                border: '1px solid var(--tt-color-border)',
                borderRadius: '0.5rem',
              }}
            >
              <option value="">Todos los pedidos</option>
              {statusOptions.map((s) => (
                <option key={s.cod_estado_pedido} value={s.cod_estado_pedido}>
                  {s.nombre} ({s.cod_estado_pedido})
                </option>
              ))}
            </select>
          </div>

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
            <span>Refrescar Lista</span>
          </button>
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
          Consultando pedidos en PostgreSQL...
        </div>
      ) : orders.length === 0 ? (
        <AdminEmptyState
          title="Sin pedidos registrados"
          description="No se encontraron pedidos que coincidan con el estado seleccionado en el servidor."
        />
      ) : (
        <AdminOrdersTable orders={orders} onOpenDetail={openOrderDetail} />
      )}

      {/* DRAWER DE DETALLE OFICIAL */}
      {(selectedDetail || detailLoading || detailError) && (
        <AdminOrderDrawer
          detail={selectedDetail}
          statusOptions={statusOptions}
          loading={detailLoading}
          error={detailError}
          onClose={closeOrderDetail}
          onStatusChange={handleStatusChange}
        />
      )}
    </AdminLayout>
  );
};
