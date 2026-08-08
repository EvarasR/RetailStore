import React, { useState, useMemo } from 'react';
import { SupportLayout } from '../../components/support/SupportLayout';
import { useSupportInternal } from '../../hooks/useSupportInternal';
import { SupportFilters } from '../../components/support/SupportFilters';
import { SupportOrderDrawer } from '../../components/support/SupportOrderDrawer';
import { ClipboardList, AlertTriangle, RefreshCw, Eye, ExternalLink } from 'lucide-react';
import type { SupportOrderItem } from '../../types/supportInternal.types';

export const SupportOrdersPage: React.FC = () => {
  const { pedidos, loading, error, handleFetchOrderDetail, reload } = useSupportInternal();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<SupportOrderItem | null>(null);

  const filteredOrders = useMemo(() => {
    return pedidos.filter((o) => {
      const matchesSearch =
        o.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(o.cod_pedido).includes(searchTerm) ||
        (o.tracking && o.tracking.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.incidencia && o.incidencia.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = selectedStatus ? o.estado === selectedStatus : true;
      return matchesSearch && matchesStatus;
    });
  }, [pedidos, searchTerm, selectedStatus]);

  return (
    <SupportLayout title="Consulta General de Pedidos">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--tt-color-text-main)' }}>
            Buscador Oficial de Órdenes del Sistema
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>
            Acceso en tiempo real a ítems, totales, tracking y resoluciones para reclamos (DB-First)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <a
            href="/panel/"
            target="_blank"
            rel="noreferrer"
            className="tt-btn tt-btn--secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', textDecoration: 'none', color: 'var(--tt-color-primary)' }}
            title="Abrir gestión de órdenes y reembolsos en Django Admin"
          >
            <span>Gestión Avanzada /panel/</span>
            <ExternalLink size={14} />
          </a>
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

      <SupportFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        statusOptions={['TODOS', 'PENDIENTE', 'PAGADO', 'VERIFICADO', 'CONFIRMADO', 'PREPARANDO', 'LISTO_ENVIO', 'EN_CAMINO', 'ENTREGADO', 'CANCELADO']}
        onReset={() => {
          setSearchTerm('');
          setSelectedStatus('');
        }}
        placeholder="Buscar por pedido #, cliente o código tracking..."
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
            <ClipboardList size={18} color="var(--tt-color-primary)" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
              Órdenes y Envíos Registrados ({filteredOrders.length})
            </h3>
          </div>
        </div>

        <div className="ops-table-container">
          <table className="ops-table">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Cliente</th>
                <th>Fecha Emisión</th>
                <th>Estado BD</th>
                <th>Tracking</th>
                <th>Monto Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--tt-color-text-light)' }}>
                    Consultando órdenes y tracking desde el servidor Django...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--tt-color-text-light)' }}>
                    No se encontraron pedidos con los criterios de búsqueda aplicados
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.cod_pedido}>
                    <td style={{ color: 'var(--tt-color-text-light)', fontWeight: 600 }}>#{ord.cod_pedido}</td>
                    <td style={{ fontWeight: 600 }}>{ord.cliente}</td>
                    <td style={{ color: 'var(--tt-color-text-muted)' }}>{ord.fecha}</td>
                    <td>
                      <span
                        className={
                          ord.estado === 'ENTREGADO'
                            ? 'ops-badge ops-badge--ok'
                            : ord.estado === 'CANCELADO'
                            ? 'ops-badge ops-badge--critica'
                            : 'ops-badge ops-badge--media'
                        }
                      >
                        {ord.estado}
                      </span>
                    </td>
                    <td style={{ fontFamily: 'monospace', color: 'var(--tt-color-primary)' }}>
                      {ord.tracking || 'TRK-' + ord.cod_pedido}
                    </td>
                    <td style={{ fontWeight: 700, color: 'var(--tt-color-success)' }}>{ord.total}</td>
                    <td>
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="tt-btn tt-btn--secondary"
                        style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        title="Ver detalle, líneas de productos y acceso para nota en soporte"
                      >
                        <Eye size={13} />
                        <span>Inspeccionar</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SupportOrderDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
        onFetchDetail={handleFetchOrderDetail}
      />
    </SupportLayout>
  );
};
