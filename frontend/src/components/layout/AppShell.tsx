import React from 'react';
import { PublicHeader } from './PublicHeader';
import { Footer } from './Footer';
import { useAuth } from '../../hooks/useAuth';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const { autenticado, es_admin, es_prime, usuario, loading, error } = useAuth();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <PublicHeader />

      {/* Barra de verificación de sesión (Fase 1 Demo & Testing) */}
      <div style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', padding: '0.5rem 0', fontSize: '0.75rem' }}>
        <div className="tt-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <strong>Estado SPA (Fase 1): </strong>
            {loading ? (
              <span>Consultando /api/session/...</span>
            ) : autenticado ? (
              <span style={{ color: '#047857' }}>
                Autenticado como: {usuario?.nombre_completo || usuario?.email} {es_prime && ' (PRIME)'} {es_admin && ' [ADMIN]'}
              </span>
            ) : (
              <span style={{ color: '#64748b' }}>Sesión visitante — /api/session/ conectado con Django DB-First</span>
            )}
            {error && <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>({error})</span>}
          </div>
          <div style={{ color: '#64748b' }}>
            <span>Proxy Vite 5173 ➔ Django 8000 activo</span>
          </div>
        </div>
      </div>

      <main style={{ flex: 1 }}>{children}</main>

      <Footer />
    </div>
  );
};
