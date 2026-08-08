import React from 'react';
import { X, ClipboardList, ExternalLink, ShieldCheck } from 'lucide-react';
import type { ProviderOrderItem } from '../../types/provider.types';

interface ProviderOrderDrawerProps {
  order: ProviderOrderItem | null;
  onClose: () => void;
}

export const ProviderOrderDrawer: React.FC<ProviderOrderDrawerProps> = ({
  order,
  onClose,
}) => {
  if (!order) return null;

  return (
    <div className="ops-drawer-overlay" onClick={onClose}>
      <div className="ops-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ops-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ClipboardList size={20} color="var(--tt-color-primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--tt-color-text-main)' }}>
              Orden de Compra y Despacho DB
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--tt-color-text-light)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="ops-drawer-body">
          <div style={{ background: 'var(--tt-color-text-main)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-surface-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--tt-color-text-light)', textTransform: 'uppercase' }}>
                ORDEN DE COMPRA #{order.cod_orden_abastecimiento}
              </span>
              <span className="ops-badge ops-badge--media">
                {order.estado}
              </span>
            </div>
            <h4 style={{ margin: '0.5rem 0 0.35rem', fontSize: '1.2rem', color: 'var(--tt-color-text-main)' }}>
              Almacén Receptor: {order.almacen || 'Almacén Principal'}
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>
              Fecha Programada DB: <strong style={{ color: '#e2e8f0' }}>{order.fecha}</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{ background: 'var(--tt-color-text-main)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-surface-subtle)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>Monto Total Estimado</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--tt-color-success)', marginTop: '0.25rem' }}>
                {order.total_estimado}
              </div>
            </div>
            <div style={{ background: 'var(--tt-color-text-main)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-surface-subtle)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>Condición Comercial</span>
              <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--tt-color-primary)', marginTop: '0.25rem' }}>
                Abastecimiento FIFO
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid var(--tt-color-primary)', padding: '1.25rem', borderRadius: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--tt-color-primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.5rem' }}>
              <ShieldCheck size={18} />
              <span>Gestión Corporativa y Facturación (DB-First)</span>
            </div>
            <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--tt-color-text-muted)', lineHeight: 1.5 }}>
              La gestión oficial de facturas fiscales, entregas mayores, firma electrónica de guías de remisión y cobros asociados se coordina directamente a través del portal histórico de proveedores o el panel corporativo Django.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <a
                href="/proveedores/"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'var(--tt-color-primary)',
                  color: '#ffffff',
                  padding: '0.55rem 1rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                <span>Portal Django /proveedores/</span>
                <ExternalLink size={14} />
              </a>
              <a
                href="/panel/"
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  background: 'var(--tt-color-surface)',
                  color: 'var(--tt-color-primary)',
                  border: '1px solid var(--tt-color-border-dark)',
                  padding: '0.55rem 1rem',
                  borderRadius: '0.5rem',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.85rem',
                }}
              >
                <span>Panel Admin /panel/</span>
                <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </div>

        <div className="ops-drawer-footer">
          <button
            onClick={onClose}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '0.5rem',
              background: 'var(--tt-color-border-dark)',
              color: 'var(--tt-color-text-main)',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
