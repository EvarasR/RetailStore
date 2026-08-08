import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { completeGoogleRegistration } from '../api/googleAuth.api';
import { useAuth } from '../hooks/useAuth';

export const CompleteGoogleRegistrationPage: React.FC = () => {
  const [form, setForm] = useState({ nombres: '', apellidos: '', telefono: '', documento_identidad: '' });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { refreshSession } = useAuth();
  const navigate = useNavigate();
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await completeGoogleRegistration(form);
      await refreshSession(true);
      navigate('/cuenta', { replace: true });
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo completar el registro.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="tt-container" style={{ padding: '3rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <form className="tt-card" onSubmit={submit} style={{ width: '100%', maxWidth: 540, padding: '2rem', display: 'grid', gap: '1rem' }}>
        <div><h1 style={{ marginBottom: '.4rem' }}>Completa tu registro</h1><p style={{ color: 'var(--tt-color-text-muted)' }}>Google verificó tu correo. Añade únicamente los datos que Google no proporciona.</p></div>
        {error && <div role="alert" className="tt-alert tt-alert--error">{error}</div>}
        <label>Nombres *<input className="tt-input" required value={form.nombres} onChange={(e) => setForm({ ...form, nombres: e.target.value })} /></label>
        <label>Apellidos *<input className="tt-input" required value={form.apellidos} onChange={(e) => setForm({ ...form, apellidos: e.target.value })} /></label>
        <label>Teléfono<input className="tt-input" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} /></label>
        <label>RUC / Cédula<input className="tt-input" value={form.documento_identidad} onChange={(e) => setForm({ ...form, documento_identidad: e.target.value })} /></label>
        <button className="tt-btn tt-btn--primary" disabled={loading}>{loading ? 'Guardando...' : 'Completar cuenta'}</button>
      </form>
    </div>
  );
};
