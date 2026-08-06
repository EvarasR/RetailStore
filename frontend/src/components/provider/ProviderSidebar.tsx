import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Building2,
  LayoutDashboard,
  Package,
  ClipboardCheck,
  History,
  Store,
} from 'lucide-react';

export const ProviderSidebar: React.FC = () => {
  return (
    <aside className="prov-sidebar" aria-label="Navegación Portal Proveedor Externo">
      <div className="prov-header">
        <Link to="/proveedor" className="prov-brand" title="Portal del Proveedor">
          <Building2 size={24} color="#38bdf8" />
          <span>TechTail Proveedor</span>
        </Link>
      </div>

      <nav className="prov-nav">
        <NavLink
          to="/proveedor"
          end
          className={({ isActive }) => `prov-nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Mi Portal</span>
        </NavLink>

        <NavLink
          to="/proveedor/productos"
          className={({ isActive }) => `prov-nav-item ${isActive ? 'active' : ''}`}
        >
          <Package size={18} />
          <span>Mis Productos y Stock</span>
        </NavLink>

        <NavLink
          to="/proveedor/ordenes"
          className={({ isActive }) => `prov-nav-item ${isActive ? 'active' : ''}`}
        >
          <ClipboardCheck size={18} />
          <span>Órdenes Abastecimiento</span>
        </NavLink>

        <NavLink
          to="/proveedor/historial"
          className={({ isActive }) => `prov-nav-item ${isActive ? 'active' : ''}`}
        >
          <History size={18} />
          <span>Historial de Relación</span>
        </NavLink>
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid #1e293b', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Link
          to="/"
          className="prov-nav-item"
          style={{ backgroundColor: 'rgba(255,255,255,0.03)', color: '#cbd5e1' }}
        >
          <Store size={17} />
          <span>Volver a la Tienda</span>
        </Link>


      </div>
    </aside>
  );
};
