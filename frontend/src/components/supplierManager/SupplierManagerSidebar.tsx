import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Truck,
  LayoutDashboard,
  Users,
  ShoppingCart,
  Package,
  AlertCircle,
  Store,
} from 'lucide-react';

export const SupplierManagerSidebar: React.FC = () => {
  return (
    <aside className="ops-sidebar" aria-label="Navegación Supplier Manager">
      <div className="ops-sidebar-header">
        <Link to="/supplier-manager" className="ops-brand" title="Inicio Supplier Manager">
          <Truck size={24} color="var(--tt-color-success)" />
          <span>TechTail Compras</span>
        </Link>
      </div>

      <nav className="ops-sidebar-nav">
        <NavLink
          to="/supplier-manager"
          end
          className={({ isActive }) => `ops-nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/supplier-manager/proveedores"
          className={({ isActive }) => `ops-nav-item ${isActive ? 'active' : ''}`}
        >
          <Users size={18} />
          <span>Proveedores</span>
        </NavLink>

        <NavLink
          to="/supplier-manager/abastecimiento"
          className={({ isActive }) => `ops-nav-item ${isActive ? 'active' : ''}`}
        >
          <ShoppingCart size={18} />
          <span>Abastecimiento</span>
        </NavLink>

        <NavLink
          to="/supplier-manager/productos"
          className={({ isActive }) => `ops-nav-item ${isActive ? 'active' : ''}`}
        >
          <Package size={18} />
          <span>Catálogo de Costos</span>
        </NavLink>

        <NavLink
          to="/supplier-manager/faltantes"
          className={({ isActive }) => `ops-nav-item ${isActive ? 'active' : ''}`}
        >
          <AlertCircle size={18} />
          <span>Stock Faltante</span>
        </NavLink>
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--tt-color-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Link
          to="/"
          className="ops-nav-item"
          style={{ backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--tt-color-text-muted)' }}
        >
          <Store size={17} />
          <span>Tienda Pública</span>
        </Link>


      </div>
    </aside>
  );
};
