import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { postJSON } from '../api/http';
import { useAuth } from '../hooks/useAuth';
import { GoogleButton } from '../components/auth/GoogleButton';
import type { GoogleAuthResponse } from '../api/googleAuth.api';

export const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    documento_identidad: '',
    password: '',
    password2: '',
    acepta: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { refreshSession } = useAuth();
  const navigate = useNavigate();

  const handleGoogleSuccess = React.useCallback(async (result: GoogleAuthResponse) => {
    if (result.onboarding_requerido) {
      navigate('/registro/completar');
      return;
    }
    await refreshSession(true);
    navigate('/cuenta');
  }, [navigate, refreshSession]);

  const handleGoogleError = React.useCallback((message: string) => setError(message), []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (formData.password !== formData.password2) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      await postJSON('/api/auth/registro/', formData);
      await refreshSession(true);
      navigate('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo crear la cuenta';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tt-container" style={{ padding: '3rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="tt-card" style={{ width: '100%', maxWidth: '540px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Registro de Cliente TechTail</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--tt-color-text-muted)' }}>
            Únete a la plataforma para acceder a descuentos corporativos y membresía Prime
          </p>
        </div>

        {error && (
          <div id="register-error" role="alert" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="register-first-name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nombres *</label>
              <input
                id="register-first-name"
                type="text"
                required
                className="tt-search__input"
                style={{ width: '100%', border: '1px solid var(--tt-color-border)', borderRadius: '0.375rem' }}
                value={formData.nombres}
                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="register-last-name" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Apellidos *</label>
              <input
                id="register-last-name"
                type="text"
                required
                className="tt-search__input"
                style={{ width: '100%', border: '1px solid var(--tt-color-border)', borderRadius: '0.375rem' }}
                value={formData.apellidos}
                onChange={(e) => setFormData({ ...formData, apellidos: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label htmlFor="register-email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Correo Electrónico Corporativo *</label>
            <input
              id="register-email"
              type="email"
              required
              className="tt-search__input"
              style={{ width: '100%', border: '1px solid var(--tt-color-border)', borderRadius: '0.375rem' }}
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="register-phone" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Teléfono</label>
              <input
                id="register-phone"
                type="text"
                className="tt-search__input"
                style={{ width: '100%', border: '1px solid var(--tt-color-border)', borderRadius: '0.375rem' }}
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="register-document" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>RUC / Cédula</label>
              <input
                id="register-document"
                type="text"
                className="tt-search__input"
                style={{ width: '100%', border: '1px solid var(--tt-color-border)', borderRadius: '0.375rem' }}
                value={formData.documento_identidad}
                onChange={(e) => setFormData({ ...formData, documento_identidad: e.target.value })}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="register-password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Contraseña * (mín. 8 caracteres)</label>
              <input
                id="register-password"
                type="password"
                required
                className="tt-search__input"
                style={{ width: '100%', border: '1px solid var(--tt-color-border)', borderRadius: '0.375rem' }}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label htmlFor="register-password-confirm" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Confirmar Contraseña *</label>
              <input
                id="register-password-confirm"
                type="password"
                required
                className="tt-search__input"
                style={{ width: '100%', border: '1px solid var(--tt-color-border)', borderRadius: '0.375rem' }}
                value={formData.password2}
                onChange={(e) => setFormData({ ...formData, password2: e.target.value })}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              backgroundColor: 'var(--tt-color-primary)',
              color: '#ffffff',
              padding: '0.875rem',
              borderRadius: '0.5rem',
              fontWeight: 700,
              marginTop: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Registrando cuenta...' : 'Crear Cuenta TechTail'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', margin: '1.5rem 0', color: 'var(--tt-color-text-muted)', fontSize: '.8rem' }}>
          <span style={{ height: 1, background: 'var(--tt-color-border)', flex: 1 }} /> o <span style={{ height: 1, background: 'var(--tt-color-border)', flex: 1 }} />
        </div>
        <GoogleButton mode="login" onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

        <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--tt-color-border)', textAlign: 'center', fontSize: '0.875rem' }}>
          <span>¿Ya tienes cuenta? </span>
          <Link to="/login" style={{ color: 'var(--tt-color-primary-hover)', fontWeight: 700 }}>
            Iniciar sesión
          </Link>
        </div>
      </div>
    </div>
  );
};
