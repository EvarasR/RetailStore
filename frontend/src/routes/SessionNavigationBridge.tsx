import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isValidNextRoute } from '../utils/authUtils';

let isNavigating = false;

export const SessionNavigationBridge: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { expireSession } = useAuth();

  useEffect(() => {
    const handleSessionExpired = () => {
      // 1. Limpiar la sesión global
      expireSession();

      // Si ya estamos navegando o ya estamos en /login, evitamos bucles
      if (isNavigating || location.pathname === '/login') {
        return;
      }

      isNavigating = true;

      // 2. Obtener ruta interna actual
      const currentPath = location.pathname + location.search;
      
      // 3. Construir next validado
      const nextParam = isValidNextRoute(currentPath) 
        ? `?next=${encodeURIComponent(currentPath)}` 
        : '';

      // 4. Navegar a /login
      navigate(`/login${nextParam}`, { replace: true });

      // Resetear flag tras un ciclo del event loop
      setTimeout(() => {
        isNavigating = false;
      }, 100);
    };

    window.addEventListener('session_expired', handleSessionExpired);
    return () => {
      window.removeEventListener('session_expired', handleSessionExpired);
    };
  }, [expireSession, navigate, location.pathname, location.search]);

  return <>{children}</>;
};
