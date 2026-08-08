import React from 'react';
import { X, Layers, Calendar, Barcode, ShieldCheck } from 'lucide-react';
import type { WarehouseLotItem } from '../../types/warehouse.types';

interface WarehouseLotDetailDrawerProps {
  lote: WarehouseLotItem | null;
  onClose: () => void;
}

export const WarehouseLotDetailDrawer: React.FC<WarehouseLotDetailDrawerProps> = ({
  lote,
  onClose,
}) => {
  if (!lote) return null;

  return (
    <div className="ops-drawer-overlay" onClick={onClose}>
      <div className="ops-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ops-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Layers size={20} color="var(--tt-color-primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--tt-color-text-main)' }}>
              Trazabilidad de Lote DB
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--tt-color-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                LOTE #{lote.id}
              </span>
              <span className="ops-badge ops-badge--ok">
                EN BODEGA
              </span>
            </div>
            <h4 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1.2rem', color: 'var(--tt-color-text-main)' }}>
              {lote.producto}
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>
              Almacén Asignado: <strong style={{ color: '#e2e8f0' }}>{lote.almacen}</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{ background: 'var(--tt-color-text-main)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-surface-subtle)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>Código Oficial</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--tt-color-text-main)', marginTop: '0.25rem' }}>
                {lote.codigo_lote}
              </div>
            </div>
            <div style={{ background: 'var(--tt-color-text-main)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-surface-subtle)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>Unidades Disponibles</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--tt-color-primary)', marginTop: '0.25rem' }}>
                {lote.cantidad}
              </div>
            </div>
            <div style={{ background: 'var(--tt-color-text-main)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-surface-subtle)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Calendar size={20} color="var(--tt-color-text-light)" />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)', display: 'block' }}>Fecha Vencimiento</span>
                <strong style={{ color: 'var(--tt-color-text-main)', fontSize: '0.95rem' }}>{lote.fecha_vencimiento}</strong>
              </div>
            </div>
            <div style={{ background: 'var(--tt-color-text-main)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-surface-subtle)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Barcode size={20} color="var(--tt-color-text-light)" />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)', display: 'block' }}>Código de Barras</span>
                <strong style={{ color: 'var(--tt-color-text-main)', fontSize: '0.95rem' }}>{lote.codigo_lote}</strong>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--tt-color-text-main)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-surface-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--tt-color-text-light)', fontSize: '0.85rem' }}>
              <ShieldCheck size={16} />
              <span>Rotación FIFO y Control de Caducidad</span>
            </div>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--tt-color-text-muted)', lineHeight: 1.5 }}>
              La gestión de vencimientos es procesada en el servidor a través de PostgreSQL para asegurar la correcta progresión del stock físico.
            </p>
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
