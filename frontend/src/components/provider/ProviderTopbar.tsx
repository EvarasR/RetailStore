import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Building, Shield } from 'lucide-react';

interface ProviderTopbarProps {
  title: string;
  razonSocial?: string;
}

export const ProviderTopbar: React.FC<ProviderTopbarProps> = ({ title, razonSocial }) => {
  const { usuario, es_admin } = useAuth();

  return (
    <header className="ops-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--tt-color-text-main)' }}>
          {title}
        </h1>
        {razonSocial && (
          <span
            className="ops-badge"
            style={{ backgroundColor: 'rgba(56, 189, 248, 0.2)', color: 'var(--tt-color-primary)' }}
          >
            {razonSocial}
          </span>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          {es_admin ? <Shield size={16} color="var(--tt-color-warning)" /> : <Building size={16} color="var(--tt-color-primary)" />}
          <span style={{ color: 'var(--tt-color-text-muted)', fontWeight: 500 }}>
            {usuario?.nombre_completo || usuario?.email || 'Socio Proveedor'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)' }}>
            ({es_admin ? 'ADMIN' : 'EXTERNO'})
          </span>
        </div>
      </div>
    </header>
  );
};
