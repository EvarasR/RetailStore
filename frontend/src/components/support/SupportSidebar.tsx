import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Headphones,
  LayoutDashboard,
  MessageSquare,
  AlertOctagon,
  ClipboardList,
  Store,
} from 'lucide-react';

export const SupportSidebar: React.FC = () => {
  return (
    <aside className="ops-sidebar" aria-label="Navegación Soporte Interno">
      <div className="ops-sidebar-header">
        <Link to="/support" className="ops-brand" title="Inicio Soporte Interno">
          <Headphones size={24} color="var(--tt-color-warning)" />
          <span>TechTail Soporte</span>
        </Link>
      </div>

      <nav className="ops-sidebar-nav">
        <NavLink
          to="/support"
          end
          className={({ isActive }) => `ops-nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/support/tickets"
          className={({ isActive }) => `ops-nav-item ${isActive ? 'active' : ''}`}
        >
          <MessageSquare size={18} />
          <span>Tickets Clientes</span>
        </NavLink>

        <NavLink
          to="/support/incidencias"
          className={({ isActive }) => `ops-nav-item ${isActive ? 'active' : ''}`}
        >
          <AlertOctagon size={18} />
          <span>Incidencias de Pedidos</span>
        </NavLink>

        <NavLink
          to="/support/pedidos"
          className={({ isActive }) => `ops-nav-item ${isActive ? 'active' : ''}`}
        >
          <ClipboardList size={18} />
          <span>Consulta de Pedidos</span>
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
