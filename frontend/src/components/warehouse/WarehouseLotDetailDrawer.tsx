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
            <Layers size={20} color="#3b82f6" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
              Trazabilidad de Lote DB
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                LOTE #{lote.id}
              </span>
              <span className="ops-badge ops-badge--ok">
                EN BODEGA
              </span>
            </div>
            <h4 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1.2rem', color: '#f8fafc' }}>
              {lote.producto}
            </h4>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Almacén Asignado: <strong style={{ color: '#e2e8f0' }}>{lote.almacen}</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #1f2937' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Código Oficial</span>
              <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginTop: '0.25rem' }}>
                {lote.codigo_lote}
              </div>
            </div>
            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #1f2937' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Unidades Disponibles</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#3b82f6', marginTop: '0.25rem' }}>
                {lote.cantidad}
              </div>
            </div>
            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #1f2937', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Calendar size={20} color="#94a3b8" />
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Fecha Vencimiento</span>
                <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>{lote.fecha_vencimiento}</strong>
              </div>
            </div>
            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #1f2937', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Barcode size={20} color="#94a3b8" />
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Código de Barras</span>
                <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>{lote.codigo_lote}</strong>
              </div>
            </div>
          </div>

          <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #1f2937' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#94a3b8', fontSize: '0.85rem' }}>
              <ShieldCheck size={16} />
              <span>Rotación FIFO y Control de Caducidad</span>
            </div>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
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
