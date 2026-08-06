import React, { useState, useMemo } from 'react';
import { WarehouseLayout } from '../../components/warehouse/WarehouseLayout';
import { useWarehouse } from '../../hooks/useWarehouse';
import { WarehouseFilters } from '../../components/warehouse/WarehouseFilters';
import { WarehouseOrderDrawer } from '../../components/warehouse/WarehouseOrderDrawer';
import { ClipboardList, AlertTriangle, CheckCircle2, RefreshCw, PackageOpen } from 'lucide-react';
import type { WarehouseOrderItem } from '../../types/warehouse.types';

export const WarehouseOrdersPage: React.FC = () => {
  const { pedidos, loading, error, actionLoading, handleOrderState, handleFetchOrderDetail, reload } = useWarehouse();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [mensajeOk, setMensajeOk] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<WarehouseOrderItem | null>(null);

  const filteredOrders = useMemo(() => {
    return pedidos.filter((o) => {
      const matchesSearch =
        o.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(o.cod_pedido).includes(searchTerm) ||
        o.estado.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesEstado = selectedEstado ? o.estado === selectedEstado : true;
      return matchesSearch && matchesEstado;
    });
  }, [pedidos, searchTerm, selectedEstado]);

  return (
    <WarehouseLayout title="Despacho y Pedidos Operativos">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>
            Cola de Preparación, Picking y Despacho
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
            Auditoría de picking DB-First y control de transiciones operativas (PREPARANDO, LISTO_ENVIO)
          </p>
        </div>

        <button
          onClick={reload}
          disabled={loading}
          className="tt-btn tt-btn--secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
        >
          <RefreshCw size={15} />
          <span>Actualizar Cola</span>
        </button>
      </div>

      <WarehouseFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedAlmacen=""
        onAlmacenChange={() => {}}
        almacenesDisponibles={[]}
        selectedEstado={selectedEstado}
        onEstadoChange={setSelectedEstado}
        estadosDisponibles={['TODOS', 'PAGADO', 'VERIFICADO', 'CONFIRMADO', 'EN_PREPARACION', 'PREPARANDO', 'LISTO_ENVIO']}
        onReset={() => {
          setSearchTerm('');
          setSelectedEstado('');
        }}
        placeholder="Buscar pedido # o nombre de cliente..."
      />

      {mensajeOk && (
        <div className="tt-alert tt-alert--success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} />
          <span>{mensajeOk}</span>
        </div>
      )}

      {error && (
        <div className="tt-alert tt-alert--error" style={{ marginBottom: '1.25rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="ops-table-card">
        <div className="ops-table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ClipboardList size={18} color="#60a5fa" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
              Órdenes Asignadas a Logística de Almacén ({filteredOrders.length})
            </h3>
          </div>
        </div>

        <div className="ops-table-container">
          <table className="ops-table">
            <thead>
              <tr>
                <th>ID Pedido</th>
                <th>Número / Ref</th>
                <th>Cliente Logística</th>
                <th>Fecha Despacho</th>
                <th>Estado BD</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    Consultando cola logística en PostgreSQL...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No hay pedidos que coincidan con los criterios de filtro seleccionados
                  </td>
                </tr>
              ) : (
                filteredOrders.map((o) => (
                  <tr key={o.cod_pedido}>
                    <td style={{ color: '#94a3b8' }}>#{o.cod_pedido}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {`ORD-${o.cod_pedido}`}
                    </td>
                    <td style={{ fontWeight: 600 }}>{o.cliente}</td>
                    <td style={{ color: '#cbd5e1' }}>{o.fecha}</td>
                    <td>
                      <span className="ops-badge ops-badge--media">{o.estado}</span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>{o.total}</td>
                    <td>
                      <button
                        onClick={() => setSelectedOrder(o)}
                        disabled={actionLoading}
                        className="tt-btn tt-btn--secondary"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                        title="Ver líneas, picking list y actualizar estado de bodega"
                      >
                        <PackageOpen size={14} />
                        <span>Bitácora & Picking</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <WarehouseOrderDrawer
        order={selectedOrder}
        loading={actionLoading}
        onClose={() => setSelectedOrder(null)}
        onFetchDetail={handleFetchOrderDetail}
        onUpdateState={async (cod, est, com) => {
          const res = await handleOrderState(cod, est, com);
          setMensajeOk(res.mensaje || `Estado logístico del pedido #${cod} actualizado en PostgreSQL a ${est}`);
          return res;
        }}
        onReload={() => {
          reload();
          setSelectedOrder(null);
        }}
      />
    </WarehouseLayout>
  );
};
