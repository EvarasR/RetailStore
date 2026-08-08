import React from 'react';
import { AlertTriangle, CheckCircle } from 'lucide-react';
import type { AdminAlertItem } from '../../types/adminInventory.types';

interface AdminInventoryAlertsProps {
  alerts: AdminAlertItem[];
  onResolve?: (cod_alerta: number) => Promise<unknown>;
}

export const AdminInventoryAlerts: React.FC<AdminInventoryAlertsProps> = ({ alerts, onResolve }) => {
  if (alerts.length === 0) {
    return (
      <div
        style={{
          padding: '2.5rem',
          background: 'var(--tt-color-surface)',
          border: '1px solid var(--tt-color-border)',
          borderRadius: '0.75rem',
          textAlign: 'center',
          color: 'var(--tt-color-success)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <CheckCircle size={32} />
        <strong style={{ color: 'var(--tt-color-text-main)' }}>
          Sin Alertas de Inventario Crítico
        </strong>
        <span style={{ fontSize: '0.8125rem', color: 'var(--tt-color-text-light)' }}>
          Todos los almacenes operan en niveles normales de abastecimiento en PostgreSQL.
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {alerts.map((a) => (
        <div
          key={a.cod_alerta}
          style={{
            padding: '1.25rem 1.5rem',
            background: a.atendida ? 'rgba(100, 116, 139, 0.08)' : 'rgba(245, 158, 11, 0.1)',
            border: `1px solid ${a.atendida ? 'var(--tt-color-border)' : 'rgba(245, 158, 11, 0.3)'}`,
            borderRadius: '0.75rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <AlertTriangle
              size={24}
              color={a.atendida ? 'var(--tt-color-text-muted)' : 'var(--tt-color-warning)'}
              style={{ flexShrink: 0 }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <strong style={{ color: 'var(--tt-color-text-main)', fontSize: '0.95rem' }}>{a.producto}</strong>
                <span className="admin-badge admin-badge-amber">{a.tipo}</span>
              </div>
              <p style={{ margin: '0.25rem 0 0', fontSize: '0.8125rem', color: 'var(--tt-color-text-muted)' }}>
                {a.mensaje} • Almacén: {a.almacen}
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-muted)' }}>
              {a.fecha || 'Reciente'}
            </span>
            {!a.atendida && onResolve && (
              <button
                type="button"
                onClick={() => onResolve(a.cod_alerta)}
                style={{
                  padding: '0.45rem 0.85rem',
                  background: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--tt-color-success)',
                  border: '1px solid rgba(16, 185, 129, 0.3)',
                  borderRadius: '0.375rem',
                  cursor: 'pointer',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Marcar Resuelta
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};
