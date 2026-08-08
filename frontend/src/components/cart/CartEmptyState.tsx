import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, LogIn } from 'lucide-react';
import emptyCartUrl from '../../assets/empty-cart.svg';

interface CartEmptyStateProps {
  isAuthenticated: boolean;
}

export const CartEmptyState: React.FC<CartEmptyStateProps> = ({ isAuthenticated }) => {
  return (
    <div
      className="tt-card"
      style={{
        padding: '3.5rem 2rem',
        textAlign: 'center',
        maxWidth: '560px',
        margin: '2rem auto',
      }}
    >
      <img
        src={emptyCartUrl}
        alt="Carrito vacío TechTail"
        style={{ height: '160px', marginBottom: '1.5rem', opacity: 0.85 }}
      />

      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
        {isAuthenticated
          ? 'Tu carrito corporativo TechTail está vacío'
          : 'Inicia sesión para ver o crear tu carrito'}
      </h2>

      <p
        style={{
          color: 'var(--tt-color-text-muted)',
          fontSize: '0.9375rem',
          marginBottom: '2rem',
          lineHeight: '1.6',
          maxWidth: '440px',
          margin: '0 auto 2rem',
        }}
      >
        {isAuthenticated
          ? 'Descubre nuestro catálogo de equipamiento IT, servidores, redes y hardware especializado con cotización y descuentos por volumen en PostgreSQL.'
          : 'Para garantizar que tu cotización, lista de compra e inventario corporativo se sincronicen de forma segura, ingresa a tu cuenta TechTail.'}
      </p>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        {isAuthenticated ? (
          <Link
            to="/catalogo"
            style={{
              backgroundColor: 'var(--tt-color-primary)',
              color: '#ffffff',
              padding: '0.875rem 1.75rem',
              borderRadius: '0.5rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            Explorar Catálogo <ArrowRight size={18} />
          </Link>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                backgroundColor: 'var(--tt-color-primary)',
                color: '#ffffff',
                padding: '0.875rem 1.75rem',
                borderRadius: '0.5rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <LogIn size={18} /> Iniciar Sesión
            </Link>
            <Link
              to="/catalogo"
              style={{
                backgroundColor: 'var(--tt-color-surface)',
                color: 'var(--tt-color-text-main)',
                border: '1px solid var(--tt-color-border)',
                padding: '0.875rem 1.75rem',
                borderRadius: '0.5rem',
                fontWeight: 700,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              Ver Catálogo
            </Link>
          </>
        )}
      </div>
    </div>
  );
};
