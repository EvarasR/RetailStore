import React, { useState } from 'react';
import { Mail, CheckCircle2, Check } from 'lucide-react';

interface EmailVerificationCardProps {
  email?: string | null;
  isVerified?: boolean;
  onVerify: () => Promise<unknown>;
}

export const EmailVerificationCard: React.FC<EmailVerificationCardProps> = ({
  email,
  isVerified = false,
  onVerify,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [verifiedState, setVerifiedState] = useState(isVerified);

  const handleVerify = async () => {
    setLoading(true);
    setError(null);
    try {
      await onVerify();
      setVerifiedState(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo verificar el correo en el servidor.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        backgroundColor: 'var(--tt-color-surface)',
        border: `1px solid ${verifiedState ? 'rgba(16, 185, 129, 0.3)' : 'var(--tt-color-border)'}`,
        borderRadius: '0.75rem',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            width: '44px',
            height: '44px',
            borderRadius: '0.65rem',
            backgroundColor: verifiedState ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: verifiedState ? 'var(--tt-color-success)' : 'var(--tt-color-warning)',
          }}
        >
          <Mail size={22} />
        </div>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: 'var(--tt-color-text-main)' }}>
              Correo Electrónico Registrado
            </h4>
            <span
              className="tt-badge"
              style={{
                backgroundColor: verifiedState ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                color: verifiedState ? 'var(--tt-color-success)' : 'var(--tt-color-warning)',
                fontSize: '0.75rem',
                fontWeight: 700,
                padding: '0.2rem 0.6rem',
                borderRadius: '9999px',
              }}
            >
              {verifiedState ? 'Verificado en BD' : 'Pendiente de Confirmación'}
            </span>
          </div>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.875rem', color: 'var(--tt-color-text-muted)' }}>
            {email || 'usuario@techtail.ec'}
          </p>
          {error && <p style={{ color: 'var(--tt-color-error)', fontSize: '0.8125rem', margin: '0.4rem 0 0 0' }}>{error}</p>}
        </div>
      </div>

      <div>
        {verifiedState ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--tt-color-success)', fontWeight: 700, fontSize: '0.875rem' }}>
            <CheckCircle2 size={18} />
            <span>Cuenta protegida y confirmada</span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleVerify}
            className="tt-btn tt-btn--primary"
            disabled={loading}
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', padding: '0.5rem 1rem' }}
          >
            <Check size={16} />
            <span>{loading ? 'Confirmando en BD...' : 'Confirmar Verificación de Email'}</span>
          </button>
        )}
      </div>
    </div>
  );
};
