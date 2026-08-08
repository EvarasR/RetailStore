import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, MapPin, ShieldCheck, LogOut } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { useTheme } from '../../hooks/useTheme';
import { SearchAutocomplete } from '../ui/SearchAutocomplete';
import { CategoryStrip } from '../ui/CategoryStrip';
import { ThemeToggle } from '../ui/ThemeToggle';
import techTailLogoSvg from '../../assets/brand/techtail-logo.svg';
import techTailLogoDarkSvg from '../../assets/brand/techtail-logo-dark.svg';
import techTailHeaderBadgeSvg from '../../assets/brand/techtail-header-badge.svg';

export const PublicHeader: React.FC = () => {
  const { autenticado, es_admin, es_prime, es_proveedor_externo, roles, usuario, logout } = useAuth();
  const { cart } = useCart();
  const { isDark } = useTheme();

  return (
    <header className="tt-header">
      {/* Barra Principal Superior */}
      <div className="tt-container tt-header__main">
        {/* Zona Izquierda: Logo + Ubicación compacta + Mini badge */}
        <div className="tt-header__left">
          <Link to="/" className="tt-header__logo" aria-label="Portada de TechTail">
            <img
              src={isDark ? techTailLogoDarkSvg : techTailLogoSvg}
              alt="TechTail Enterprise Marketplace"
              style={{ height: '36px', width: 'auto', display: 'block' }}
            />
          </Link>

          {/* Bloque de Ubicación / Envío Compacto en 2 líneas */}
          <div className="tt-header__delivery" title="Centro de Distribución TechTail">
            <MapPin size={16} color="var(--tt-color-primary)" style={{ flexShrink: 0 }} />
            <div className="tt-header__delivery-lines">
              <span className="tt-header__delivery-top">
                Enviar a Madrid / LATAM
              </span>
              <span className="tt-header__delivery-strong">
                Almacén Central • 24h
              </span>
            </div>
          </div>

          {/* Mini Banner / Brand Mark de confianza integrado */}
          <div
            className="tt-header__brand-badge"
            title="Infraestructura Tecnológica Enterprise Certificada"
          >
            <img
              src={techTailHeaderBadgeSvg}
              alt="TechTail Enterprise • SLA 24h"
              style={{ height: '24px', width: 'auto', display: 'block' }}
            />
          </div>
        </div>

        {/* Buscador Protagonista Central */}
        <SearchAutocomplete />

        {/* Navegación Derecha: Tema + Cuenta + Pedidos + Carrito */}
        <nav className="tt-header__nav" aria-label="Accesos rápidos de cuenta, pedidos y tema">
          <ThemeToggle />

          {autenticado ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Link to="/cuenta" className="tt-nav-item" title="Mi Cuenta React (/cuenta)">
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <span>Hola, {usuario?.nombres || usuario?.email || 'Usuario'}</span>
                  {es_prime && <ShieldCheck size={13} color="var(--tt-color-primary)" />}
                </span>
                <span className="tt-nav-item__strong">
                  Mi Cuenta • {es_prime ? 'PRIME' : 'Estándar'}
                </span>
              </Link>

              {es_admin && (
                <div style={{ display: 'flex', gap: '0.4rem', alignItems: 'center' }}>
                  <Link
                    to="/admin/dashboard"
                    className="tt-nav-item"
                    style={{ backgroundColor: 'var(--tt-color-primary)', color: '#fff', padding: '0.25rem 0.55rem', borderRadius: '0.25rem' }}
                    title="Panel Ejecutivo React (/admin)"
                  >
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700 }}>ERP</span>
                    <span className="tt-nav-item__strong">/admin</span>
                  </Link>
                </div>
              )}

              {(es_proveedor_externo || roles?.includes('SUPPLIER_MANAGER')) && (
                <Link
                  to="/proveedor/dashboard"
                  className="tt-nav-item"
                  style={{ backgroundColor: 'var(--tt-color-surface)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}
                  title="Portal Proveedor React"
                >
                  <span style={{ fontSize: '0.6875rem', color: 'var(--tt-color-primary-hover)', fontWeight: 700 }}>EXTERNO</span>
                  <span className="tt-nav-item__strong">/proveedor</span>
                </Link>
              )}

              <button
                type="button"
                onClick={() => logout()}
                className="tt-nav-item"
                style={{ padding: '0.35rem', color: 'var(--tt-color-error)' }}
                title="Cerrar sesión"
                aria-label="Cerrar sesión en TechTail"
              >
                <LogOut size={17} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Link to="/login" className="tt-nav-item" title="Iniciar sesión en TechTail React">
                <span>Hola, identifícate</span>
                <span className="tt-nav-item__strong">Cuentas y Roles</span>
              </Link>
            </div>
          )}

          <Link to="/cuenta/pedidos" className="tt-nav-item" title="Historial y devoluciones (/cuenta/pedidos)">
            <span>Devoluciones</span>
            <span className="tt-nav-item__strong">y Pedidos</span>
          </Link>

          <Link to="/carrito" className="tt-cart-button" aria-label="Ver carrito de compras">
            <ShoppingCart size={19} color="var(--tt-color-primary)" />
            <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.15 }}>
              <span style={{ fontSize: '0.6875rem', color: 'var(--tt-color-text-light)' }}>CARRITO</span>
              <span style={{ fontWeight: 700 }}>Carrito</span>
            </span>
            <span className="tt-cart-badge">{cart?.cantidad_items || 0}</span>
          </Link>
        </nav>
      </div>

      {/* Barra Inferior de Categorías (Category Strip Limpio) */}
      <CategoryStrip />
    </header>
  );
};
