import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  Building2,
  Truck,
  Percent,
  Tag,
  CreditCard,
  Navigation,
  Crown,
  BarChart3,
  ShieldCheck,
  ExternalLink,
  Shield,
  Headphones,
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <NavLink to="/admin/dashboard" className="admin-brand-link">
          <Shield size={24} className="text-blue-500" />
          <span>TechTail ERP</span>
        </NavLink>
        <span className="admin-brand-badge">ADMIN</span>
      </div>

      <nav className="admin-sidebar-nav" style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 140px)' }}>
        <NavLink
          to="/admin/dashboard"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
        >
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        <NavLink
          to="/admin/productos"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
        >
          <Package size={18} />
          <span>Productos</span>
        </NavLink>

        <NavLink
          to="/admin/pedidos"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
        >
          <ShoppingCart size={18} />
          <span>Pedidos</span>
        </NavLink>

        <NavLink
          to="/admin/inventario"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
        >
          <Boxes size={18} />
          <span>Inventario</span>
        </NavLink>

        <NavLink
          to="/admin/proveedores"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
        >
          <Building2 size={18} />
          <span>Proveedores</span>
        </NavLink>

        <NavLink
          to="/admin/abastecimiento"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
        >
          <Truck size={18} />
          <span>Abastecimiento</span>
        </NavLink>

        <NavLink
          to="/admin/cupones"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
        >
          <Percent size={18} />
          <span>Cupones</span>
        </NavLink>

        <NavLink
          to="/admin/promociones"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
        >
          <Tag size={18} />
          <span>Promociones</span>
        </NavLink>

        <NavLink
          to="/admin/pagos"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
        >
          <CreditCard size={18} />
          <span>Pagos y Facturas</span>
        </NavLink>

        <NavLink
          to="/admin/tracking"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
        >
          <Navigation size={18} />
          <span>Tracking Admin</span>
        </NavLink>

        <NavLink
          to="/admin/prime"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
        >
          <Crown size={18} />
          <span>Membresía Prime</span>
        </NavLink>

        <NavLink
          to="/admin/reportes"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
        >
          <BarChart3 size={18} />
          <span>Reportes Ventas</span>
        </NavLink>

        <NavLink
          to="/admin/control"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
        >
          <ShieldCheck size={18} />
          <span>Control y Seguridad</span>
        </NavLink>
      </nav>

      <div className="admin-sidebar-footer" style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: '#94a3b8', padding: '0 0.5rem' }}>
          Roles Operativos
        </div>
        <NavLink
          to="/warehouse"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
        >
          <Boxes size={16} color="#3b82f6" />
          <span>Bodega (/warehouse)</span>
        </NavLink>
        <NavLink
          to="/supplier-manager"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
        >
          <Truck size={16} color="#10b981" />
          <span>Compras (/supplier-manager)</span>
        </NavLink>
        <NavLink
          to="/support"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
        >
          <Headphones size={16} color="#f59e0b" />
          <span>Soporte (/support)</span>
        </NavLink>
        <NavLink
          to="/proveedor"
          className={({ isActive }) => `admin-nav-item ${isActive ? 'active' : ''}`}
          style={{ padding: '0.5rem 0.75rem', fontSize: '0.8rem' }}
        >
          <Building2 size={16} color="#38bdf8" />
          <span>Proveedor (/proveedor)</span>
        </NavLink>

        <a
          href="/panel/"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-classic-fallback-btn"
          style={{ marginTop: '0.5rem' }}
          title="Abre el panel clásico Django para gestión avanzada no implementada en React"
        >
          <span>Abrir Panel Clásico</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </aside>
  );
};

