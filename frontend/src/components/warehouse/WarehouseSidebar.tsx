import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Boxes,
  LayoutDashboard,
  PackageCheck,
  Layers,
  AlertTriangle,
  ClipboardList,
  ExternalLink,
  Store,
} from 'lucide-react';

export const WarehouseSidebar: React.FC = () => {
  return (
    <aside className="ops-sidebar" aria-label="Navegación Almacén Operativo">
      <div className="ops-sidebar-header">
        <Link to="/warehouse" className="ops-brand" title="Inicio Bodega y Almacén">
          <Boxes size={24} color="#3b82f6" />
          <span>TechTail Bodega</span>
        </Link>
      </div>

      <nav className="ops-sidebar-nav">
        <NavLink
          to="/warehouse"
          end
          className={({ isActive }) => `ops-nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/warehouse/inventario"
          className={({ isActive }) => `ops-nav-item ${isActive ? 'active' : ''}`}
        >
          <PackageCheck size={18} />
          <span>Inventario</span>
        </NavLink>

        <NavLink
          to="/warehouse/lotes"
          className={({ isActive }) => `ops-nav-item ${isActive ? 'active' : ''}`}
        >
          <Layers size={18} />
          <span>Lotes</span>
        </NavLink>

        <NavLink
          to="/warehouse/alertas"
          className={({ isActive }) => `ops-nav-item ${isActive ? 'active' : ''}`}
        >
          <AlertTriangle size={18} />
          <span>Alertas Stock</span>
        </NavLink>

        <NavLink
          to="/warehouse/pedidos"
          className={({ isActive }) => `ops-nav-item ${isActive ? 'active' : ''}`}
        >
          <ClipboardList size={18} />
          <span>Pedidos Operativos</span>
        </NavLink>
      </nav>

      <div style={{ padding: '1rem', borderTop: '1px solid var(--tt-color-border)', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Link
          to="/"
          className="ops-nav-item"
          style={{ backgroundColor: 'rgba(255,255,255,0.03)', color: '#cbd5e1' }}
        >
          <Store size={17} />
          <span>Tienda Pública</span>
        </Link>

        <a
          href="/panel/"
          target="_blank"
          rel="noopener noreferrer"
          className="ops-nav-item"
          style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa' }}
          title="Panel Django clásico (/panel/)"
        >
          <ExternalLink size={17} />
          <span>Panel Clásico (/panel/)</span>
        </a>
      </div>
    </aside>
  );
};
