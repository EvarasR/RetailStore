import React from 'react';
import { Shield, LogOut, Key, UserCheck } from 'lucide-react';
import type { PasswordChangePayload } from '../../types/security.types';
import { PasswordForm } from './PasswordForm';
import { EmailVerificationCard } from './EmailVerificationCard';
import { GoogleSecurityCard } from './GoogleSecurityCard';
import type { GoogleSecurityState } from '../../api/googleAuth.api';

interface SecurityPanelProps {
  email?: string | null;
  isVerified?: boolean;
  userFullName?: string | null;
  userRole?: string | null;
  onChangePassword: (payload: PasswordChangePayload) => Promise<unknown>;
  onVerifyEmail: () => Promise<unknown>;
  onLogout: () => void;
  googleState: GoogleSecurityState | null;
  reloadGoogleState: () => Promise<void>;
}

export const SecurityPanel: React.FC<SecurityPanelProps> = ({
  email,
  isVerified = false,
  userFullName,
  userRole,
  onChangePassword,
  onVerifyEmail,
  onLogout,
  googleState,
  reloadGoogleState,
}) => {
  return (
    <div className="tt-security-panel" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Resumen de seguridad y sesión corporativa */}
      <div
        style={{
          backgroundColor: 'var(--tt-color-surface)',
          border: '1px solid var(--tt-color-border)',
          borderRadius: '0.75rem',
          padding: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '0.75rem',
              backgroundColor: 'rgba(14, 165, 233, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--tt-color-primary)',
            }}
          >
            <Shield size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--tt-color-primary)', textTransform: 'uppercase' }}>
                SESIÓN CORPORATIVA ACTIVA
              </span>
              <span
                className="tt-badge"
                style={{
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  color: 'var(--tt-color-success)',
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  padding: '0.2rem 0.55rem',
                  borderRadius: '9999px',
                }}
              >
                AUTENTICADO DB
              </span>
            </div>
            <h4 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0.2rem 0 0 0', color: 'var(--tt-color-text-main)' }}>
              {userFullName || 'Usuario TechTail'} ({userRole || 'CUSTOMER'})
            </h4>
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={() => {
              if (window.confirm('¿Deseas cerrar tu sesión corporativa en el servidor TechTail?')) {
                onLogout();
              }
            }}
            className="tt-btn tt-btn--secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', color: 'var(--tt-color-error)', borderColor: 'rgba(239, 68, 68, 0.3)', padding: '0.5rem 1.1rem' }}
          >
            <LogOut size={16} />
            <span>Cerrar Sesión Segura</span>
          </button>
        </div>
      </div>

      {/* Tarjeta de verificación de correo */}
      <div>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--tt-color-text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <UserCheck size={18} color="var(--tt-color-primary)" />
          <span>Verificación Fiscal / Email</span>
        </h4>
        <EmailVerificationCard
          email={email}
          isVerified={isVerified}
          onVerify={onVerifyEmail}
        />
      </div>

      <GoogleSecurityCard state={googleState} reload={reloadGoogleState} />

      {/* Formulario de cambio de contraseña */}
      <div>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--tt-color-text-main)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Key size={18} color="var(--tt-color-primary)" />
          <span>Credenciales de Acceso</span>
        </h4>
        <PasswordForm onChangePassword={onChangePassword} requiresCurrentPassword={googleState?.password_configurada ?? true} />
      </div>
    </div>
  );
};
