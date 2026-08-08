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
            <Building2 size={20} color="var(--tt-color-primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--tt-color-text-main)' }}>
              Ficha y Datos de Proveedor (DB)
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
                PROVEEDOR #{supplier.cod_proveedor}
              </span>
              <span className={`ops-badge ${supplier.activo !== false ? 'ops-badge--ok' : 'ops-badge--critica'}`}>
                {supplier.activo !== false ? 'ACTIVO EN BD' : 'INACTIVO'}
              </span>
            </div>
            <h4 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1.25rem', color: 'var(--tt-color-text-main)' }}>
              {supplier.razon_social}
            </h4>
            {supplier.nombre_comercial && (
              <div style={{ fontSize: '0.9rem', color: 'var(--tt-color-primary)', marginBottom: '0.5rem' }}>
                {supplier.nombre_comercial}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--tt-color-warning)', fontSize: '0.9rem' }}>
              <Star size={16} fill="var(--tt-color-warning)" />
              <strong>{supplier.calificacion || '4.5'}</strong>
              <span style={{ color: 'var(--tt-color-text-light)' }}>/ 5.0 (evaluación continua)</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{ background: 'var(--tt-color-text-main)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-surface-subtle)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--tt-color-text-light)' }}>RUC / NIT Tributario</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--tt-color-text-main)', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                {supplier.ruc || 'No registrado'}
              </div>
            </div>
            <div style={{ background: 'var(--tt-color-text-main)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-surface-subtle)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--tt-color-text-light)' }}>Ciudad / Provincia</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={15} color="var(--tt-color-primary)" />
                <span>{supplier.ciudad || 'Quito'}{supplier.provincia ? `, ${supplier.provincia}` : ''}</span>
              </div>
            </div>
          </div>

          <div style={{ background: 'var(--tt-color-text-main)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-surface-subtle)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Mail size={18} color="var(--tt-color-text-light)" />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)', display: 'block' }}>Correo de Contacto</span>
                <strong style={{ color: 'var(--tt-color-text-main)', fontSize: '0.9rem' }}>
                  {supplier.email || 'contacto@proveedor.com'}
                </strong>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Phone size={18} color="var(--tt-color-text-light)" />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)', display: 'block' }}>Teléfono Logístico</span>
                <strong style={{ color: 'var(--tt-color-text-main)', fontSize: '0.9rem' }}>
                  {supplier.telefono || 'Sin número asignado'}
                </strong>
              </div>
            </div>
          </div>

          <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid var(--tt-color-primary)', padding: '1rem', borderRadius: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--tt-color-primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
              <ShieldCheck size={18} />
              <span>Gestión Administrativa DB-First</span>
            </div>
            <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--tt-color-text-muted)', lineHeight: 1.5 }}>
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
                background: 'var(--tt-color-primary)',
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
