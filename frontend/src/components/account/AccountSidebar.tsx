import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  User,
  MapPin,
  ShoppingBag,
  Heart,
  LogOut,
  LayoutDashboard,
  Bell,
  HelpCircle,
  Award,
  Shield,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export const AccountSidebar: React.FC = () => {
  const { usuario, es_prime, roles, logout } = useAuth();

  const navItems = [
    { to: '/cuenta', label: 'Resumen', icon: LayoutDashboard, end: true },
    { to: '/cuenta/perfil', label: 'Datos Personales', icon: User, end: false },
    { to: '/cuenta/direcciones', label: 'Mis Direcciones', icon: MapPin, end: false },
    { to: '/cuenta/pedidos', label: 'Mis Pedidos', icon: ShoppingBag, end: false },
    { to: '/cuenta/wishlist', label: 'Wishlist Favoritos', icon: Heart, end: false },
    { to: '/cuenta/notificaciones', label: 'Notificaciones', icon: Bell, end: false },
    { to: '/cuenta/soporte', label: 'Soporte y Tickets', icon: HelpCircle, end: false },
    { to: '/cuenta/membresia', label: 'Membresía Prime', icon: Award, end: false },
    { to: '/cuenta/seguridad', label: 'Seguridad y Acceso', icon: Shield, end: false },
  ];

  return (
    <aside className="tt-account-sidebar">
      {/* Tarjeta de Identidad */}
      <div className="tt-account-sidebar__profile">
        <div className="tt-account-sidebar__avatar">
          {usuario?.nombres ? usuario.nombres.charAt(0).toUpperCase() : 'T'}
        </div>
        <div className="tt-account-sidebar__user-info">
          <h3 className="tt-account-sidebar__name">
            {usuario?.nombre_completo || usuario?.nombres || usuario?.email || 'Cliente TechTail'}
          </h3>
          <span className="tt-account-sidebar__email">{usuario?.email}</span>
          <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
            <span
              className="tt-badge"
              style={{
                backgroundColor: es_prime ? 'rgba(217, 119, 6, 0.15)' : 'rgba(14, 165, 233, 0.12)',
                color: es_prime ? '#d97706' : 'var(--tt-color-primary)',
                fontSize: '0.6875rem',
                fontWeight: 700,
              }}
            >
              {es_prime ? 'PRIME ENTERPRISE' : 'CLIENTE ESTÁNDAR'}
            </span>
            {roles?.map((r) => (
              <span
                key={r}
                className="tt-badge"
                style={{
                  backgroundColor: 'var(--tt-color-surface-hover)',
                  color: 'var(--tt-color-text-muted)',
                  fontSize: '0.6875rem',
                }}
              >
                {r}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Menú principal React FASE 5.1 */}
      <nav className="tt-account-sidebar__nav" aria-label="Menú de cuenta">
        <ul className="tt-account-sidebar__list">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    `tt-account-sidebar__link ${isActive ? 'tt-account-sidebar__link--active' : ''}`
                  }
                >
                  <Icon size={18} />
                  <span>{item.label}</span>
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>



      {/* Cerrar sesión */}
      <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--tt-color-border)' }}>
        <button
          type="button"
          onClick={() => logout()}
          className="tt-account-sidebar__logout"
          aria-label="Cerrar sesión en TechTail"
        >
          <LogOut size={18} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
};
