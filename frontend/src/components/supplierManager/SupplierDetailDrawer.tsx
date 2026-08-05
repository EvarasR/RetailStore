import React from 'react';
import { X, Building2, Mail, Phone, MapPin, Star, ExternalLink, ShieldCheck } from 'lucide-react';
import type { SupplierManagerSupplierItem } from '../../types/supplierManager.types';

interface SupplierDetailDrawerProps {
  supplier: SupplierManagerSupplierItem | null;
  onClose: () => void;
}

export const SupplierDetailDrawer: React.FC<SupplierDetailDrawerProps> = ({
  supplier,
  onClose,
}) => {
  if (!supplier) return null;

  return (
    <div className="ops-drawer-overlay" onClick={onClose}>
      <div className="ops-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ops-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Building2 size={20} color="#3b82f6" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
              Ficha y Datos de Proveedor (DB)
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
                PROVEEDOR #{supplier.cod_proveedor}
              </span>
              <span className={`ops-badge ${supplier.activo !== false ? 'ops-badge--ok' : 'ops-badge--critica'}`}>
                {supplier.activo !== false ? 'ACTIVO EN BD' : 'INACTIVO'}
              </span>
            </div>
            <h4 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1.25rem', color: '#f8fafc' }}>
              {supplier.razon_social}
            </h4>
            {supplier.nombre_comercial && (
              <div style={{ fontSize: '0.9rem', color: '#38bdf8', marginBottom: '0.5rem' }}>
                {supplier.nombre_comercial}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#fbbf24', fontSize: '0.9rem' }}>
              <Star size={16} fill="#fbbf24" />
              <strong>{supplier.calificacion || '4.5'}</strong>
              <span style={{ color: '#94a3b8' }}>/ 5.0 (evaluación continua)</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #1f2937' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>RUC / NIT Tributario</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#f8fafc', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                {supplier.ruc || 'No registrado'}
              </div>
            </div>
            <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #1f2937' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Ciudad / Provincia</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={15} color="#60a5fa" />
                <span>{supplier.ciudad || 'Quito'}{supplier.provincia ? `, ${supplier.provincia}` : ''}</span>
              </div>
            </div>
          </div>

          <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #1f2937', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Mail size={18} color="#94a3b8" />
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Correo de Contacto</span>
                <strong style={{ color: '#f8fafc', fontSize: '0.9rem' }}>
                  {supplier.email || 'contacto@proveedor.com'}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Phone size={18} color="#94a3b8" />
              <div>
                <span style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'block' }}>Teléfono Logístico</span>
                <strong style={{ color: '#f8fafc', fontSize: '0.9rem' }}>
                  {supplier.telefono || 'Sin número asignado'}
                </strong>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid #3b82f6', padding: '1rem', borderRadius: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#60a5fa', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
              <ShieldCheck size={18} />
              <span>Gestión Administrativa DB-First</span>
            </div>
            <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.5 }}>
              Para edición avanzada de razones sociales, condiciones fiscales o convenios de abastecimiento, utiliza el módulo corporativo en Django Django Admin.
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
              <span>Abrir Panel Corporativo /panel/</span>
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
