import React, { useState, useMemo } from 'react';
import { ProviderLayout } from '../../components/provider/ProviderLayout';
import { useProviderPortal } from '../../hooks/useProviderPortal';
import { ProviderFilters } from '../../components/provider/ProviderFilters';
import { ProviderOrderDrawer } from '../../components/provider/ProviderOrderDrawer';
import { ClipboardCheck, AlertTriangle, RefreshCw, Eye } from 'lucide-react';
import type { ProviderOrderItem } from '../../types/provider.types';

export const ProviderOrdersPage: React.FC = () => {
  const { proveedor, ordenes, loading, error, reload } = useProviderPortal();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<ProviderOrderItem | null>(null);

  const filteredOrders = useMemo(() => {
    return ordenes.filter((o) => {
      const matchesSearch =
        String(o.cod_orden_abastecimiento).includes(searchTerm) ||
        (o.almacen && o.almacen.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = selectedStatus ? o.estado === selectedStatus : true;
      return matchesSearch && matchesStatus;
    });
  }, [ordenes, searchTerm, selectedStatus]);

  return (
    <ProviderLayout title="Órdenes de Abastecimiento Asignadas" razonSocial={proveedor?.razon_social}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--tt-color-text-main)' }}>
            Solicitudes de Entrega de TechTail
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>
            Listado oficial en BD de pedidos pendientes de entrega y montos estimados
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            onClick={reload}
            disabled={loading}
            className="tt-btn tt-btn--secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <RefreshCw size={15} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <ProviderFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        statusOptions={['TODOS', 'PENDIENTE', 'EN_REVISION', 'APROBADA', 'EN_TRANSITO', 'RECIBIDA']}
        onReset={() => {
          setSearchTerm('');
          setSelectedStatus('');
        }}
        placeholder="Buscar orden de compra # o almacén..."
      />

      {error && (
        <div className="tt-alert tt-alert--error" style={{ marginBottom: '1.25rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="ops-table-card">
        <div className="ops-table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardCheck size={18} color="var(--tt-color-primary)" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
              Registro de Órdenes de Suministro ({filteredOrders.length})
            </h3>
          </div>
        </div>

        <div className="ops-table-container">
          <table className="ops-table">
            <thead>
              <tr>
                <th>ID Orden</th>
                <th>Almacén Destino</th>
                <th>Fecha Emisión / Prog.</th>
                <th>Estado BD</th>
                <th>Total Estimado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--tt-color-text-light)' }}>
                    Consultando órdenes emitidas por TechTail al proveedor...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--tt-color-text-light)' }}>
                    No se encontraron órdenes de compra asignadas a tu cuenta
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.cod_orden_abastecimiento}>
                    <td style={{ color: 'var(--tt-color-text-light)', fontWeight: 600 }}>
                      #{ord.cod_orden_abastecimiento}
                    </td>
                    <td style={{ fontWeight: 600 }}>
                      {ord.almacen || 'Almacén Principal (Quito)'}
                    </td>
                    <td style={{ color: 'var(--tt-color-text-muted)' }}>{ord.fecha || 'N/D'}</td>
                    <td>
                      <span
                        className={
                          ord.estado === 'RECIBIDA'
                            ? 'ops-badge ops-badge--ok'
                            : 'ops-badge ops-badge--media'
                        }
                      >
                        {ord.estado}
                      </span>
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--tt-color-success)' }}>
                      {ord.total_estimado}
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="tt-btn tt-btn--secondary"
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        title="Ver condiciones, detalle de entrega y escala a Django"
                      >
                        <Eye size={13} />
                        <span>Detalle de Entrega</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProviderOrderDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </ProviderLayout>
  );
};
