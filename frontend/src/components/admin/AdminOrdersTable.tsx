import React from 'react';
import { Eye, AlertTriangle } from 'lucide-react';
import { AdminStatusBadge } from './AdminStatusBadge';
import type { AdminOrderItem } from '../../types/adminOrder.types';

interface AdminOrdersTableProps {
  orders: AdminOrderItem[];
  onOpenDetail: (cod_pedido: number | string) => void;
}

export const AdminOrdersTable: React.FC<AdminOrdersTableProps> = ({ orders, onOpenDetail }) => {
  return (
    <div className="admin-table-container">
      <div className="admin-table-wrapper">
        <table className="admin-table">
          <thead>
            <tr>
              <th># Pedido / Fecha</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Abastecimiento</th>
              <th>Total Oficial DB</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.cod_pedido}>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--tt-color-text-main)' }}>{o.numero_pedido}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-muted)' }}>
                    {o.fecha || 'Reciente'}
                  </div>
                </td>
                <td>
                  <div style={{ fontWeight: 600, color: '#e2e8f0' }}>{o.cliente}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-muted)' }}>{o.email}</div>
                </td>
                <td>
                  <AdminStatusBadge status={o.estado} label={o.estado_nombre || o.estado} />
                </td>
                <td>
                  {o.requiere_abastecimiento ? (
                    <span
                      className="admin-badge admin-badge-amber"
                      title="Requiere orden de abastecimiento"
                    >
                      <AlertTriangle size={12} />
                      <span>Bodega Req.</span>
                    </span>
                  ) : (
                    <span className="admin-badge admin-badge-gray">Normal</span>
                  )}
                </td>
                <td>
                  <strong style={{ color: 'var(--tt-color-primary)', fontSize: '0.95rem' }}>${o.total}</strong>
                </td>
                <td>
                  <button
                    type="button"
                    onClick={() => onOpenDetail(o.cod_pedido)}
                    style={{
                      padding: '0.35rem 0.7rem',
                      background: 'rgba(59, 130, 246, 0.15)',
                      color: 'var(--tt-color-primary)',
                      border: '1px solid transparent',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.3rem',
                      fontSize: '0.7875rem',
                      fontWeight: 600,
                    }}
                  >
                    <Eye size={14} />
                    <span>Ver Detalle</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
