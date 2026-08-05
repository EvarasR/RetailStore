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
            <Package size={20} color="#3b82f6" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
              Detalle Técnico de Inventario
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="ops-drawer-body">
          <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #1f2937' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {item.sku || `SKU #${item.cod_producto}`}
            </span>
            <h4 style={{ margin: '0.5rem 0 0.75rem', fontSize: '1.25rem', color: '#f8fafc' }}>
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
            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #1f2937' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Stock Físico (DB)</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
                {stockFisico}
              </div>
            </div>
            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #1f2937' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Reservado Pedidos</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.25rem' }}>
                {stockRes}
              </div>
            </div>
            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #1f2937' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Disponible Oficial</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#10b981', marginTop: '0.25rem' }}>
                {stockDisp}
              </div>
            </div>
            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #1f2937' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Umbral Reorden</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#ef4444', marginTop: '0.25rem' }}>
                {stockMin}
              </div>
            </div>
          </div>

          <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #1f2937' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
              <ShieldCheck size={16} />
              <span>Fuente Oficial de Datos</span>
            </div>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
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
              background: '#334155',
              color: '#f8fafc',
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
