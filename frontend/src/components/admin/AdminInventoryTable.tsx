import React from 'react';
import { AdminStatusBadge } from './AdminStatusBadge';
import type { AdminInventoryItem, AdminLoteItem } from '../../types/adminInventory.types';

interface AdminInventoryTableProps {
  inventory: AdminInventoryItem[];
  lotes: AdminLoteItem[];
  activeTab: 'stock' | 'lotes';
  onTabChange: (tab: 'stock' | 'lotes') => void;
}

export const AdminInventoryTable: React.FC<AdminInventoryTableProps> = ({
  inventory,
  lotes,
  activeTab,
  onTabChange,
}) => {
  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '1rem',
          borderBottom: '1px solid var(--tt-color-border)',
          paddingBottom: '0.5rem',
        }}
      >
        <button
          type="button"
          onClick={() => onTabChange('stock')}
          style={{
            padding: '0.5rem 1rem',
            background: activeTab === 'stock' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            color: activeTab === 'stock' ? '#3b82f6' : '#94a3b8',
            border: 'none',
            borderRadius: '0.375rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Stock General BD ({inventory.length})
        </button>
        <button
          type="button"
          onClick={() => onTabChange('lotes')}
          style={{
            padding: '0.5rem 1rem',
            background: activeTab === 'lotes' ? 'rgba(59, 130, 246, 0.2)' : 'transparent',
            color: activeTab === 'lotes' ? '#3b82f6' : '#94a3b8',
            border: 'none',
            borderRadius: '0.375rem',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Lotes Registrados ({lotes.length})
        </button>
      </div>

      {activeTab === 'stock' && (
        <div className="admin-table-container">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Producto</th>
                  <th>Almacén</th>
                  <th>Stock Total</th>
                  <th>Reservado</th>
                  <th>Disponible</th>
                  <th>Stock Mínimo</th>
                  <th>Actualización</th>
                </tr>
              </thead>
              <tbody>
                {inventory.map((inv, idx) => {
                  const isCritico = inv.stock_disponible <= inv.stock_minimo;
                  return (
                    <tr key={`${inv.cod_producto}-${idx}`}>
                      <td>#{inv.cod_producto}</td>
                      <td>
                        <strong style={{ color: '#f8fafc' }}>{inv.producto}</strong>
                      </td>
                      <td>{inv.almacen}</td>
                      <td>{inv.stock_total} un.</td>
                      <td style={{ color: inv.stock_reservado > 0 ? '#f59e0b' : '#94a3b8' }}>
                        {inv.stock_reservado} un.
                      </td>
                      <td>
                        <strong style={{ color: isCritico ? '#ef4444' : '#10b981' }}>
                          {inv.stock_disponible} un.
                        </strong>
                      </td>
                      <td>{inv.stock_minimo} un.</td>
                      <td style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {inv.fecha_actualizacion || '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'lotes' && (
        <div className="admin-table-container">
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Lote / Estado</th>
                  <th>Producto</th>
                  <th>Almacén</th>
                  <th>Disponible</th>
                  <th>Reservada</th>
                  <th>Costo BD</th>
                  <th>PVP BD</th>
                  <th>Recepción</th>
                </tr>
              </thead>
              <tbody>
                {lotes.map((l) => (
                  <tr key={l.cod_lote}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{l.numero_lote}</div>
                      <div style={{ marginTop: '0.2rem' }}>
                        <AdminStatusBadge status={l.estado} />
                      </div>
                    </td>
                    <td>{l.producto}</td>
                    <td>{l.almacen}</td>
                    <td>
                      <strong>{l.disponible} un.</strong>
                    </td>
                    <td>{l.reservada} un.</td>
                    <td>${l.costo}</td>
                    <td>
                      <strong style={{ color: '#38bdf8' }}>${l.pvp}</strong>
                    </td>
                    <td style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      {l.fecha_recepcion || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
