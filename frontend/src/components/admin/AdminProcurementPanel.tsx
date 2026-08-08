import React from 'react';
import type { AdminProcurementOrder } from '../../types/adminProcurement.types';
import { CheckCircle2, XCircle } from 'lucide-react';

interface AdminProcurementPanelProps {
  orders: AdminProcurementOrder[];
  loading: boolean;
  actionLoading: number | null;
  onAction: (cod_orden: number, accion: 'recibir' | 'cancelar', observacion?: string) => Promise<unknown>;
}

export const AdminProcurementPanel: React.FC<AdminProcurementPanelProps> = ({
  orders,
  loading,
  actionLoading,
  onAction,
}) => {
  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--tt-color-text-muted)' }}>
        Cargando órdenes de abastecimiento de almacén...
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--tt-color-text-muted)' }}>
        No hay solicitudes de abastecimiento activas en PostgreSQL.
      </div>
    );
  }

  return (
    <div className="admin-table-container">
      <table className="admin-table">
        <thead>
          <tr>
            <th># Orden</th>
            <th>Proveedor</th>
            <th>Almacén Destino</th>
            <th>Total Oficial DB</th>
            <th>Fecha Solicitud</th>
            <th>Estado</th>
            <th>Acción DB</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((ord) => (
            <tr key={ord.cod_orden_abastecimiento}>
              <td style={{ fontWeight: 700 }}>#{ord.cod_orden_abastecimiento}</td>
              <td style={{ fontWeight: 600 }}>{ord.proveedor}</td>
              <td>{ord.almacen || 'Almacén Principal'}</td>
              <td style={{ fontWeight: 700, color: 'var(--tt-color-primary)' }}>{ord.total_estimado}</td>
              <td style={{ fontSize: '0.825rem', color: 'var(--tt-color-text-muted)' }}>{ord.fecha}</td>
              <td>
                <span className={`status-badge status-${ord.estado.toLowerCase()}`}>
                  {ord.estado}
                </span>
              </td>
              <td>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    type="button"
                    onClick={() => onAction(ord.cod_orden_abastecimiento, 'recibir', 'Recepción validada desde Admin React')}
                    disabled={actionLoading === ord.cod_orden_abastecimiento || ord.estado === 'RECIBIDA' || ord.estado === 'CANCELADA'}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem 0.65rem',
                      background: 'rgba(16, 185, 129, 0.12)',
                      border: '1px solid rgba(16, 185, 129, 0.3)',
                      borderRadius: 'var(--tt-radius-sm)',
                      color: 'var(--tt-color-success)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: ord.estado === 'RECIBIDA' || ord.estado === 'CANCELADA' ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <CheckCircle2 size={13} />
                    <span>Recibir</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onAction(ord.cod_orden_abastecimiento, 'cancelar', 'Cancelado desde panel React')}
                    disabled={actionLoading === ord.cod_orden_abastecimiento || ord.estado === 'RECIBIDA' || ord.estado === 'CANCELADA'}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      padding: '0.35rem 0.65rem',
                      background: 'rgba(239, 68, 68, 0.12)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: 'var(--tt-radius-sm)',
                      color: 'var(--tt-color-error)',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      cursor: ord.estado === 'RECIBIDA' || ord.estado === 'CANCELADA' ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <XCircle size={13} />
                    <span>Cancelar</span>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
