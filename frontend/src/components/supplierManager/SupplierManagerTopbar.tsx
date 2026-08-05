import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Shield, UserCheck } from 'lucide-react';

interface SupplierManagerTopbarProps {
  title: string;
}

export const SupplierManagerTopbar: React.FC<SupplierManagerTopbarProps> = ({ title }) => {
  const { usuario, roles, es_admin } = useAuth();

  return (
    <header className="ops-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
          {title}
        </h1>
        <span
          className="ops-badge"
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.2)', color: '#34d399' }}
        >
          SUPPLIER_MANAGER
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
          {es_admin ? <Shield size={16} color="#f59e0b" /> : <UserCheck size={16} color="#34d399" />}
          <span style={{ color: '#cbd5e1', fontWeight: 500 }}>
            {usuario?.nombre_completo || usuario?.email || 'Gestor de Compras'}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            ({roles.length > 0 ? roles.join(', ') : es_admin ? 'ADMIN' : 'SUPPLIER_MANAGER'})
          </span>
        </div>
      </div>
    </header>
  );
};
