import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Skeleton } from '../components/ui/Skeleton';

interface RoleRouteProps {
  requiredRole?: string;
  requiredRoles?: string[];
  requireExternalProvider?: boolean;
  children: React.ReactNode;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({
  requiredRole,
  requiredRoles,
  requireExternalProvider = false,
  children,
}) => {
  const { autenticado, loading, es_admin, roles, es_proveedor_externo } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div style={{ padding: '3rem', maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <Skeleton height="40px" width="30%" />
        <Skeleton height="200px" width="100%" />
      </div>
    );
  }

  if (!autenticado) {
    return <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  let hasPermission = false;
  const userRoles = roles || [];

  if (es_admin) {
    // Si es ADMIN, tiene permiso por defecto a rutas de admin/internas. 
    // PERO no tiene acceso automático a requireExternalProvider salvo que realmente lo sea.
    if (requireExternalProvider) {
      hasPermission = Boolean(es_proveedor_externo);
    } else {
      hasPermission = true;
    }
  } else if (requireExternalProvider) {
    hasPermission = Boolean(es_proveedor_externo);
  } else if (requiredRole) {
    hasPermission = userRoles.includes(requiredRole);
  } else if (requiredRoles && requiredRoles.length > 0) {
    hasPermission = requiredRoles.some((r) => userRoles.includes(r));
  } else {
    hasPermission = true;
  }

  if (!hasPermission) {
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
};

