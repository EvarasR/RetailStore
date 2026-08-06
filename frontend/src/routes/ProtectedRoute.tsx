import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Skeleton } from '../components/ui/Skeleton';

interface ProtectedRouteProps {
  children: React.ReactElement;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { autenticado, loading } = useAuth();
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

  return children;
};
