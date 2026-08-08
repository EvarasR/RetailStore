import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Shield, UserCheck } from 'lucide-react';

interface WarehouseTopbarProps {
  title: string;
}

export const WarehouseTopbar: React.FC<WarehouseTopbarProps> = ({ title }) => {
  const { usuario, roles, es_admin } = useAuth();

  return (
    <header className="ops-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: 'var(--tt-color-text-main)' }}>
          {title}
        </h1>
        <span
          className="ops-badge"
          style={{ backgroundColor: 'rgba(59, 130, 246, 0.2)', color: 'var(--tt-color-primary)' }}
        >
          WAREHOUSE_MANAGER
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          {es_admin ? <Shield size={16} color="var(--tt-color-warning)" /> : <UserCheck size={16} color="var(--tt-color-primary)" />}
          <span style={{ color: 'var(--tt-color-text-muted)', fontWeight: 500 }}>
            {usuario?.nombre_completo || usuario?.email || 'Bodeguero Operativo'}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)' }}>
            ({roles.length > 0 ? roles.join(', ') : es_admin ? 'ADMIN' : 'WAREHOUSE_MANAGER'})
          </span>
        </div>
      </div>
    </header>
  );
};
