import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HelpCircle, Store, ArrowLeft } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getDefaultRouteForSession } from '../utils/authUtils';

export const NotFoundPage: React.FC = () => {
  const { autenticado, ...session } = useAuth();
  const navigate = useNavigate();

  const dashboardRoute = autenticado ? getDefaultRouteForSession(session) : '/login';

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#0b0f19',
        padding: '2rem',
      }}
    >
      <div
        style={{
          maxWidth: '520px',
          width: '100%',
          backgroundColor: 'var(--tt-color-surface)',
          border: '1px solid var(--tt-color-surface-subtle)',
          borderRadius: '1rem',
          padding: '2.5rem 2rem',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1.25rem',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '9999px',
            background: 'rgba(234, 179, 8, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#eab308',
          }}
        >
          <HelpCircle size={28} />
        </div>

        <div>
          <h2
            style={{
              margin: '0 0 0.5rem 0',
              fontSize: '1.35rem',
              fontWeight: 700,
              color: 'var(--tt-color-text-main)',
            }}
          >
            Página No Encontrada (404)
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--tt-color-text-light)', lineHeight: 1.5 }}>
            La ruta a la que intentas acceder no existe o fue movida.
          </p>
        </div>

        <div
          style={{
            display: 'flex',
            gap: '1rem',
            width: '100%',
            marginTop: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => navigate(-1)}
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              backgroundColor: 'transparent',
              color: 'var(--tt-color-text-muted)',
              border: '1px solid var(--tt-color-border-dark)',
              borderRadius: '0.5rem',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <ArrowLeft size={16} />
            <span>Volver</span>
          </button>

          <Link
            to="/"
            style={{
              flex: 1,
              padding: '0.75rem 1rem',
              backgroundColor: 'var(--tt-color-primary)',
              color: '#ffffff',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            <Store size={18} />
            <span>Ir al Catálogo</span>
          </Link>
        </div>

        {autenticado && (
          <Link
            to={dashboardRoute}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              color: 'var(--tt-color-text-muted)',
              border: '1px solid var(--tt-color-border-dark)',
              borderRadius: '0.5rem',
              textDecoration: 'none',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
            }}
          >
            <span>Ir a Mi Panel</span>
          </Link>
        )}
      </div>
    </div>
  );
};
