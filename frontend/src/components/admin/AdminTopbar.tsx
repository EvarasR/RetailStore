import React from 'react';
import { Link } from 'react-router-dom';
import { Store, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

interface AdminTopbarProps {
  title: string;
}

export const AdminTopbar: React.FC<AdminTopbarProps> = ({ title }) => {
  const { usuario, roles } = useAuth();

  const primaryRole = roles && roles.length > 0 ? roles[0] : 'ADMIN';
  const displayUser =
    usuario?.nombre_completo || usuario?.nombres || usuario?.email || 'Administrador';

  return (
    <header className="admin-topbar">
      <div className="admin-topbar-left">
        <h1 className="admin-topbar-title">{title}</h1>
      </div>

      <div className="admin-topbar-right">
        <Link to="/" className="admin-store-btn" title="Volver al Storefront">
          <Store size={16} />
          <span>Ver Tienda</span>
        </Link>

        <div className="admin-user-pill">
          <User size={16} className="text-slate-400" />
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--tt-color-text-main)' }}>
            {displayUser}
          </span>
          <span className="admin-user-role-badge">{primaryRole}</span>
        </div>
      </div>
    </header>
  );
};
