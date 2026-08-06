import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { postJSON } from '../api/http';
import { useAuth } from '../hooks/useAuth';

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
  const { refetch } = useAuth();
  const navigate = useNavigate();

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
      await refetch();
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
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Únete a la plataforma para acceder a descuentos corporativos y membresía Prime
          </p>
        </div>

        {error && (
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', color: '#b91c1c', padding: '0.75rem', borderRadius: '0.375rem', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Nombres *</label>
              <input
                type="text"
                required
                className="tt-search__input"
                style={{ width: '100%', border: '1px solid var(--tt-color-border)', borderRadius: '0.375rem' }}
                value={formData.nombres}
                onChange={(e) => setFormData({ ...formData, nombres: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Apellidos *</label>
              <input
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
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Correo Electrónico Corporativo *</label>
            <input
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
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Teléfono</label>
              <input
                type="text"
                className="tt-search__input"
                style={{ width: '100%', border: '1px solid var(--tt-color-border)', borderRadius: '0.375rem' }}
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>RUC / Cédula</label>
              <input
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
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Contraseña * (mín. 8 caracteres)</label>
              <input
                type="password"
                required
                className="tt-search__input"
                style={{ width: '100%', border: '1px solid var(--tt-color-border)', borderRadius: '0.375rem' }}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.25rem' }}>Confirmar Contraseña *</label>
              <input
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

        <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--tt-color-border)', textAlign: 'center', fontSize: '0.875rem' }}>
          <span>¿Ya tienes cuenta? </span>
          <Link to="/login" style={{ color: '#0284c7', fontWeight: 700 }}>
            Iniciar sesión
          </Link>
        </div>

        <div style={{ marginTop: '1.25rem', padding: '0.875rem', backgroundColor: 'var(--tt-color-surface)', border: '1px solid var(--tt-color-border)', borderRadius: '0.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)', marginBottom: '0.35rem' }}>
            ¿Prefieres el registro clásico o tienes problemas?
          </div>
          <a
            href="/registro/"
            style={{
              display: 'inline-block',
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: 'var(--tt-color-primary)',
              textDecoration: 'underline',
            }}
          >
            Usar registro clásico Django (/registro/)
          </a>
        </div>
      </div>
    </div>
  );
};
