import React, { useState, useMemo } from 'react';
import { SupplierManagerLayout } from '../../components/supplierManager/SupplierManagerLayout';
import { useSupplierManager } from '../../hooks/useSupplierManager';
import { SupplierManagerFilters } from '../../components/supplierManager/SupplierManagerFilters';
import { ProcurementDetailDrawer } from '../../components/supplierManager/ProcurementDetailDrawer';
import { ShoppingCart, AlertTriangle, RefreshCw, Eye, ExternalLink } from 'lucide-react';
import type { SupplierManagerProcurementItem } from '../../types/supplierManager.types';

export const SupplierManagerProcurementPage: React.FC = () => {
  const { ordenes, loading, error, reload } = useSupplierManager();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<SupplierManagerProcurementItem | null>(null);

  const filteredOrders = useMemo(() => {
    return ordenes.filter((o) => {
      const matchesSearch =
        String(o.cod_orden_abastecimiento).includes(searchTerm) ||
        (o.proveedor && o.proveedor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (o.almacen && o.almacen.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = selectedStatus ? o.estado === selectedStatus : true;
      return matchesSearch && matchesStatus;
    });
  }, [ordenes, searchTerm, selectedStatus]);

  return (
    <SupplierManagerLayout title="Órdenes de Abastecimiento (Procurement)">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--tt-color-text-main)' }}>
            Control de Pedidos de Compra a Proveedores
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>
            Seguimiento de compras de reposición, entregas programadas y saldos de almacén
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <a
            href="/panel/"
            target="_blank"
            rel="noreferrer"
            className="tt-btn tt-btn--secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', textDecoration: 'none', color: 'var(--tt-color-primary)' }}
            title="Crear nueva orden de abastecimiento en panel administrativo Django"
          >
            <span>Crear Orden en /panel/</span>
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

      <SupplierManagerFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        statusOptions={['TODOS', 'PENDIENTE', 'EN_REVISION', 'APROBADA', 'EN_TRANSITO', 'RECIBIDA']}
        onReset={() => {
          setSearchTerm('');
          setSelectedStatus('');
        }}
        placeholder="Buscar por orden #, razón social o almacén..."
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
            <ShoppingCart size={18} color="var(--tt-color-primary)" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
              Registro de Órdenes de Abastecimiento ({filteredOrders.length})
            </h3>
          </div>
        </div>

        <div className="ops-table-container">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Orden</th>
                <th>Proveedor Asignado</th>
                <th>Almacén Destino</th>
                <th>Fecha Creación</th>
                <th>Total Estimado</th>
                <th>Estado BD</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--tt-color-text-light)' }}>
                    Consultando órdenes de abastecimiento desde PostgreSQL...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: 'var(--tt-color-text-light)' }}>
                    No se encontraron órdenes de compra que coincidan con los filtros aplicados
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => (
                  <tr key={ord.cod_orden_abastecimiento}>
                    <td style={{ color: 'var(--tt-color-text-light)', fontWeight: 600 }}>
                      #{ord.cod_orden_abastecimiento}
                    </td>
                    <td style={{ fontWeight: 600 }}>{ord.proveedor || 'Proveedor Corporativo'}</td>
                    <td>{ord.almacen || 'Principal'}</td>
                    <td style={{ color: 'var(--tt-color-text-muted)' }}>{ord.fecha_creacion || 'Reciente'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--tt-color-success)' }}>
                      {ord.total_estimado}
                    </td>
                    <td>
                      <span
                        className={
                          ord.estado === 'RECIBIDA'
                            ? 'ops-badge ops-badge--ok'
                            : ord.estado === 'PENDIENTE'
                            ? 'ops-badge ops-badge--media'
                            : 'ops-badge ops-badge--media'
                        }
                      >
                        {ord.estado}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="tt-btn tt-btn--secondary"
                        style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                        title="Ver detalle de orden de abastecimiento"
                      >
                        <Eye size={13} />
                        <span>Detalle</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProcurementDetailDrawer
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </SupplierManagerLayout>
  );
};
