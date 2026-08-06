import React, { useState } from 'react';
import { Lock, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';
import type { PasswordChangePayload } from '../../types/security.types';

interface PasswordFormProps {
  onChangePassword: (payload: PasswordChangePayload) => Promise<unknown>;
}

export const PasswordForm: React.FC<PasswordFormProps> = ({ onChangePassword }) => {
  const [passwordActual, setPasswordActual] = useState('');
  const [passwordNueva, setPasswordNueva] = useState('');
  const [passwordConfirmacion, setPasswordConfirmacion] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordActual || !passwordNueva || !passwordConfirmacion) {
      setError('Por favor completa los tres campos de contraseña.');
      return;
    }
    if (passwordNueva.length < 8) {
      setError('La nueva contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (passwordNueva !== passwordConfirmacion) {
      setError('La nueva contraseña y su confirmación no coinciden.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      await onChangePassword({
        password_actual: passwordActual,
        password_nueva: passwordNueva,
        password_confirmacion: passwordConfirmacion,
      });
      setPasswordActual('');
      setPasswordNueva('');
      setPasswordConfirmacion('');
      setSuccess('Tu contraseña corporativa ha sido actualizada con seguridad en el servidor.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo cambiar la contraseña.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="tt-password-form"
      style={{
        backgroundColor: 'var(--tt-color-surface)',
        border: '1px solid var(--tt-color-border)',
        borderRadius: '0.75rem',
        padding: '1.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <Lock size={20} color="var(--tt-color-primary)" />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
          Cambiar Contraseña Corporativa
        </h3>
      </div>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: '#ef4444',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: '#10b981',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{success}</span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem', maxWidth: '480px' }}>
        <div>
          <label htmlFor="input-password-actual" className="tt-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.875rem' }}>
            Contraseña Actual *
          </label>
          <div style={{ position: 'relative' }}>
            <input
              id="input-password-actual"
              type={showPassword ? 'text' : 'password'}
              className="tt-input"
              style={{ width: '100%', paddingRight: '2.5rem' }}
              value={passwordActual}
              onChange={(e) => setPasswordActual(e.target.value)}
              disabled={loading}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: '0.75rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--tt-color-text-muted)',
                cursor: 'pointer',
              }}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="input-password-nueva" className="tt-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.875rem' }}>
            Nueva Contraseña (Mínimo 8 caracteres) *
          </label>
          <input
            id="input-password-nueva"
            type={showPassword ? 'text' : 'password'}
            className="tt-input"
            style={{ width: '100%' }}
            value={passwordNueva}
            onChange={(e) => setPasswordNueva(e.target.value)}
            disabled={loading}
            required
            minLength={8}
          />
        </div>

        <div>
          <label htmlFor="input-password-confirmacion" className="tt-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.875rem' }}>
            Confirmar Nueva Contraseña *
          </label>
          <input
            id="input-password-confirmacion"
            type={showPassword ? 'text' : 'password'}
            className="tt-input"
            style={{ width: '100%' }}
            value={passwordConfirmacion}
            onChange={(e) => setPasswordConfirmacion(e.target.value)}
            disabled={loading}
            required
            minLength={8}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
        <button
          type="submit"
          className="tt-btn tt-btn--primary"
          disabled={loading || !passwordActual || !passwordNueva || !passwordConfirmacion}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.5rem', fontWeight: 700 }}
        >
          <Lock size={16} />
          <span>{loading ? 'Actualizando Contraseña...' : 'Actualizar Contraseña'}</span>
        </button>
      </div>
    </form>
  );
};
