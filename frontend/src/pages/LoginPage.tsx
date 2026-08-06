import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getJSON, postJSON } from '../api/http';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { refetch } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !password) {
      setError('Por favor completa todos los campos.');
      return;
    }

    try {
      setLoading(true);
      // 1. Asegurar que exista la cookie CSRF oficial antes del login
      try {
        await getJSON('/api/session/');
      } catch {
        // Fallback silencioso por si aún no hay sesión o es visitante
      }
      // 2. Enviar credenciales en JSON
      await postJSON('/api/auth/login/', { email: email.trim(), password });
      // 3. Refrescar estado global de sesión de usuario en el hook
      await refetch();
      // 4. Redirigir al inicio del Marketplace
      navigate('/');
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
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Accede a tu cuenta corporativa en TechTail Marketplace
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.85rem', borderRadius: '0.375rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>No se pudo iniciar sesión</div>
            <div>{error}</div>
            <div style={{ marginTop: '0.6rem', paddingTop: '0.5rem', borderTop: '1px solid #fecaca' }}>
              <a href="/login/" style={{ textDecoration: 'underline', fontWeight: 700, color: '#b91c1c' }}>
                → Usar login clásico Django (/login/)
              </a>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Correo electrónico
            </label>
            <input
              type="email"
              required
              className="tt-search__input"
              style={{ width: '100%', border: '1px solid var(--tt-color-border)', borderRadius: '0.375rem' }}
              placeholder="tu@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.35rem' }}>
              Contraseña
            </label>
            <input
              type="password"
              required
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

        <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--tt-color-border)', textAlign: 'center', fontSize: '0.875rem' }}>
          <span>¿Eres nuevo en TechTail? </span>
          <Link to="/registro" style={{ color: '#0284c7', fontWeight: 700 }}>
            Crear cuenta corporativa
          </Link>
        </div>

        <div style={{ marginTop: '1.25rem', padding: '0.875rem', backgroundColor: 'var(--tt-color-surface)', border: '1px solid var(--tt-color-border)', borderRadius: '0.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)', marginBottom: '0.35rem' }}>
            ¿Prefieres la versión tradicional o tienes algún inconveniente?
          </div>
          <a
            href="/login/"
            style={{
              display: 'inline-block',
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--tt-color-primary)',
              textDecoration: 'underline',
            }}
          >
            Usar login clásico Django (/login/)
          </a>
        </div>
      </div>
    </div>
  );
};
