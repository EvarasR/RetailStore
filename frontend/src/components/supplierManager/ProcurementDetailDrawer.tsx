import React from 'react';
import { X, FileText, Calendar, ExternalLink, ShieldCheck } from 'lucide-react';
import type { SupplierManagerProcurementItem } from '../../types/supplierManager.types';

interface ProcurementDetailDrawerProps {
  order: SupplierManagerProcurementItem | null;
  onClose: () => void;
}

export const ProcurementDetailDrawer: React.FC<ProcurementDetailDrawerProps> = ({
  order,
  onClose,
}) => {
  if (!order) return null;

  return (
    <div className="ops-drawer-overlay" onClick={onClose}>
      <div className="ops-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ops-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <FileText size={20} color="#3b82f6" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
              Orden de Abastecimiento DB
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                ABASTECIMIENTO #{order.cod_orden_abastecimiento}
              </span>
              <span className="ops-badge ops-badge--media">
                {order.estado}
              </span>
            </div>
            <h4 style={{ margin: '0.5rem 0 0.35rem', fontSize: '1.2rem', color: '#f8fafc' }}>
              Proveedor: {order.proveedor || 'Proveedor General'}
            </h4>
            <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
              Almacén Logístico: <strong style={{ color: '#e2e8f0' }}>{order.almacen || 'Principal'}</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #1f2937' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Monto Total Estimado</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#10b981', marginTop: '0.25rem' }}>
                {order.total_estimado}
              </div>
            </div>
            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #1f2937' }}>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>Prioridad Asignada</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#f59e0b', marginTop: '0.25rem' }}>
                {order.prioridad || 'NORMAL'}
              </div>
            </div>
          </div>

          <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #1f2937', display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Calendar size={17} color="#94a3b8" />
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                <strong>Fecha Creación:</strong> {order.fecha_creacion || 'No especificada'}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Calendar size={17} color="#94a3b8" />
              <span style={{ fontSize: '0.85rem', color: '#cbd5e1' }}>
                <strong>Recepción Estimada:</strong> {order.fecha_estimada || 'En coordinación'}
              </span>
            </div>
          </div>

          <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid #3b82f6', padding: '1rem', borderRadius: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
              <ShieldCheck size={18} />
              <span>Creación y Emisión de Órdenes de Compra</span>
            </div>
            <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              Para emitir nuevas órdenes de abastecimiento, tramitar firmas digitales o aprobar cotizaciones, utiliza el módulo corporativo DB-First en Django.
            </p>
            <a
              href="/panel/"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#3b82f6',
                color: '#ffffff',
                padding: '0.55rem 1rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              <span>Abrir Gestión de Órdenes en /panel/</span>
              <ExternalLink size={14} />
            </a>
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
