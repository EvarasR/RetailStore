import React from 'react';
import { X, Package, ShieldCheck } from 'lucide-react';
import type { WarehouseProductItem } from '../../types/warehouse.types';

interface WarehouseInventoryDetailDrawerProps {
  item: WarehouseProductItem | null;
  onClose: () => void;
}

export const WarehouseInventoryDetailDrawer: React.FC<WarehouseInventoryDetailDrawerProps> = ({
  item,
  onClose,
}) => {
  if (!item) return null;

  const stockDisp = item.stock_disponible || 0;
  const stockRes = item.stock_reservado || 0;
  const stockFisico = stockDisp + stockRes;
  const stockMin = item.stock_minimo || 5;

  return (
    <div className="ops-drawer-overlay" onClick={onClose}>
      <div className="ops-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ops-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Package size={20} color="var(--tt-color-primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--tt-color-text-main)' }}>
              Detalle Técnico de Inventario
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
            <span style={{ fontSize: '0.8rem', color: 'var(--tt-color-text-light)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {item.sku || `SKU #${item.cod_producto}`}
            </span>
            <h4 style={{ margin: '0.5rem 0 0.75rem', fontSize: '1.25rem', color: 'var(--tt-color-text-main)' }}>
              {item.nombre}
            </h4>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <span className={`ops-badge ${item.estado === 'CRITICO' || item.estado === 'SIN_STOCK' ? 'ops-badge--critica' : 'ops-badge--ok'}`}>
                {item.estado}
              </span>
              <span className="ops-badge ops-badge--media">
                Almacén: {item.almacen || 'Principal'}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{ background: 'var(--tt-color-text-main)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-surface-subtle)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>Stock Físico (DB)</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--tt-color-text-main)', marginTop: '0.25rem' }}>
                {stockFisico}
              </div>
            </div>
            <div style={{ background: 'var(--tt-color-text-main)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-surface-subtle)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>Reservado Pedidos</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--tt-color-warning)', marginTop: '0.25rem' }}>
                {stockRes}
              </div>
            </div>
            <div style={{ background: 'var(--tt-color-text-main)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-surface-subtle)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>Disponible Oficial</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--tt-color-success)', marginTop: '0.25rem' }}>
                {stockDisp}
              </div>
            </div>
            <div style={{ background: 'var(--tt-color-text-main)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-surface-subtle)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>Umbral Reorden</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--tt-color-error)', marginTop: '0.25rem' }}>
                {stockMin}
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--tt-color-text-main)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-surface-subtle)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--tt-color-text-light)', fontSize: '0.85rem' }}>
              <ShieldCheck size={16} />
              <span>Fuente Oficial de Datos</span>
            </div>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: 'var(--tt-color-text-muted)', lineHeight: 1.5 }}>
              Las cantidades publicadas reflejan directamente los saldos oficiales calculados por el motor logístico de Django en PostgreSQL.
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
