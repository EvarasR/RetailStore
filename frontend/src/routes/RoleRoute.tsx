import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { ShieldAlert, ExternalLink, Store } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface RoleRouteProps {
  requiredRole?: string;
  requiredRoles?: string[];
  allowProvider?: boolean;
  fallbackPath?: string;
  fallbackLabel?: string;
  children: React.ReactNode;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({
  requiredRole,
  requiredRoles,
  allowProvider = false,
  fallbackPath = '/panel/',
  fallbackLabel = 'Abrir Panel Clásico',
  children,
}) => {
  const { autenticado, loading, es_admin, roles } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0b0f19',
          color: '#94a3b8',
        }}
      >
        <span>Verificando credenciales ejecutivas y operativas de seguridad...</span>
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  let hasPermission = false;
  const userRoles = roles || [];

  if (es_admin) {
    hasPermission = true;
  } else if (allowProvider) {
    hasPermission =
      userRoles.includes('PROVEEDOR') ||
      userRoles.includes('SUPPLIER_MANAGER') ||
      userRoles.includes('ADMIN') ||
      es_admin;
  } else if (requiredRole) {
    hasPermission = userRoles.includes(requiredRole) || (requiredRole === 'ADMIN' && es_admin);
  } else if (requiredRoles && requiredRoles.length > 0) {
    hasPermission = requiredRoles.some(
      (r) => userRoles.includes(r) || (r === 'ADMIN' && es_admin)
    );
  } else {
    hasPermission = true;
  }

  if (!hasPermission) {
    const roleText =
      requiredRole ||
      (requiredRoles ? requiredRoles.join(' / ') : '') ||
      (allowProvider ? 'PROVEEDOR / SUPPLIER_MANAGER' : 'ADMIN');

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
            backgroundColor: '#111827',
            border: '1px solid #1f2937',
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
              color: '#ef4444',
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
                color: '#f8fafc',
              }}
            >
              Acceso Operativo Restringido
            </h2>
            <p style={{ margin: 0, fontSize: '0.9rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Esta sección requiere el rol operativo <strong>{roleText}</strong> o permisos de{' '}
              <strong>ADMIN</strong>. Tu cuenta actual no cuenta con dicho rol.
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
            <Link
              to="/"
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                backgroundColor: '#3b82f6',
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
              <span>Volver a la Tienda</span>
            </Link>

            <a
              href={fallbackPath}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                flex: 1,
                padding: '0.75rem 1rem',
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                color: '#cbd5e1',
                border: '1px solid #334155',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
              }}
            >
              <span>{fallbackLabel}</span>
              <ExternalLink size={16} />
            </a>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

