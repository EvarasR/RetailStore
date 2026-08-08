import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isValidNextRoute, getDefaultRouteForSession } from '../utils/authUtils';
import { GoogleButton } from '../components/auth/GoogleButton';
import type { GoogleAuthResponse } from '../api/googleAuth.api';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, refreshSession, error: sessionError } = useAuth();
  const [error, setError] = useState<string | null>(sessionError || null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextRoute = searchParams.get('next');

  const handleGoogleSuccess = React.useCallback(async (result: GoogleAuthResponse) => {
    if (result.onboarding_requerido) {
      navigate('/registro/completar');
      return;
    }
    const sessionData = await refreshSession(true);
    if (isValidNextRoute(result.redirect)) navigate(result.redirect as string);
    else navigate(getDefaultRouteForSession(sessionData));
  }, [navigate, refreshSession]);

  const handleGoogleError = React.useCallback((message: string) => setError(message), []);

  // Si el auth context reporta error posteriormente (por ej. expiró estando en el login)
  React.useEffect(() => {
    if (sessionError && sessionError !== 'No se pudo consultar la sesión') {
      setError(sessionError);
    }
  }, [sessionError]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    try {
      setLoading(true);
      // 1. Ejecutar login a través del contexto central (que ya se encarga de refrescar sesión)
      const sessionData = await login({ email: email.trim(), password });
      
      // 2. Determinar a dónde redirigir basándose en next y roles
      const next = searchParams.get('next');
      if (isValidNextRoute(next)) {
        navigate(next as string);
      } else {
        navigate(getDefaultRouteForSession(sessionData));
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Credenciales incorrectas';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tt-container" style={{ padding: '4rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="tt-card" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '0.5rem' }}>Iniciar Sesión</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--tt-color-text-muted)' }}>
            Accede a tu cuenta corporativa en TechTail Marketplace
          </p>
        </div>

        {error && (
          <div id="login-error" role="alert" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.85rem', borderRadius: '0.375rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>No se pudo iniciar sesión</div>
            <div>{error}</div>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label htmlFor="login-email" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Correo electrónico
            </label>
            <input
              id="login-email"
              type="email"
              required
              aria-describedby={error ? 'login-error' : undefined}
              className="tt-search__input"
              style={{ width: '100%', border: '1px solid var(--tt-color-border)', borderRadius: '0.375rem' }}
              placeholder="tu@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="login-password" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Contraseña
            </label>
            <input
              id="login-password"
              type="password"
              required
              aria-describedby={error ? 'login-error' : undefined}
              className="tt-search__input"
              style={{ width: '100%', border: '1px solid var(--tt-color-border)', borderRadius: '0.375rem' }}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
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
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Iniciando sesión...' : 'Continuar'}
          </button>
        </form>

        <div style={{ display: 'flex', alignItems: 'center', gap: '.75rem', margin: '1.5rem 0', color: 'var(--tt-color-text-muted)', fontSize: '.8rem' }}>
          <span style={{ height: 1, background: 'var(--tt-color-border)', flex: 1 }} /> o <span style={{ height: 1, background: 'var(--tt-color-border)', flex: 1 }} />
        </div>
        <GoogleButton mode="login" next={nextRoute} onSuccess={handleGoogleSuccess} onError={handleGoogleError} />

        <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--tt-color-border)', textAlign: 'center', fontSize: '0.875rem' }}>
          <span>¿Eres nuevo en TechTail? </span>
          <Link to="/registro" style={{ color: 'var(--tt-color-primary-hover)', fontWeight: 700 }}>
            Crear cuenta corporativa
          </Link>
        </div>
      </div>
    </div>
  );
};
