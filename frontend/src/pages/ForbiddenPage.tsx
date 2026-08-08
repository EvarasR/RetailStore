import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Store, ArrowLeft, LogOut } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { getDefaultRouteForSession } from '../utils/authUtils';

export const ForbiddenPage: React.FC = () => {
  const { autenticado, logout, ...session } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

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
            background: 'rgba(239, 68, 68, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--tt-color-error)',
          }}
        >
          <ShieldAlert size={28} />
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
            Acceso Restringido (403)
          </h2>
          <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--tt-color-text-light)', lineHeight: 1.5 }}>
            No tienes los permisos necesarios para acceder a esta funcionalidad con tu rol actual.
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
            to={dashboardRoute}
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
            <span>Mi Panel</span>
          </Link>
        </div>

        {autenticado && (
          <button
            onClick={handleLogout}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1rem',
              backgroundColor: 'transparent',
              color: 'var(--tt-color-error)',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              width: '100%',
            }}
          >
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        )}
      </div>
    </div>
  );
};
