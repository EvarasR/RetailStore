import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2 } from 'lucide-react';
import type { UserProfileData } from '../../types/profile.types';
import { Alert } from '../ui/Alert';

interface ProfileFormProps {
  usuario: UserProfileData;
  onSave: (data: Record<string, string>) => Promise<unknown>;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ usuario, onSave }) => {
  const [nombres, setNombres] = useState(usuario.nombres || '');
  const [apellidos, setApellidos] = useState(usuario.apellidos || '');
  const [telefono, setTelefono] = useState(usuario.telefono || '');
  const [documento, setDocumento] = useState(usuario.documento_identidad || '');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setNombres(usuario.nombres || '');
    setApellidos(usuario.apellidos || '');
    setTelefono(usuario.telefono || '');
    setDocumento(usuario.documento_identidad || '');
  }, [usuario]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombres.trim() || !apellidos.trim()) {
      setError('Nombres y apellidos son obligatorios.');
      return;
    }
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      await onSave({
        nombres: nombres.trim(),
        apellidos: apellidos.trim(),
        telefono: telefono.trim(),
        documento_identidad: documento.trim(),
      });
      setSuccess('Tus datos corporativos se han actualizado correctamente en el servidor.');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al guardar el perfil.';
      setError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="tt-profile-form">
      {error && <Alert variant="error">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <div className="tt-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
        <div className="tt-form-group">
          <label htmlFor="pf-nombres" className="tt-form-label">
            Nombres <span style={{ color: 'var(--tt-color-error)' }}>*</span>
          </label>
          <input
            id="pf-nombres"
            type="text"
            className="tt-input"
            value={nombres}
            onChange={(e) => setNombres(e.target.value)}
            required
            disabled={saving}
          />
        </div>

        <div className="tt-form-group">
          <label htmlFor="pf-apellidos" className="tt-form-label">
            Apellidos <span style={{ color: 'var(--tt-color-error)' }}>*</span>
          </label>
          <input
            id="pf-apellidos"
            type="text"
            className="tt-input"
            value={apellidos}
            onChange={(e) => setApellidos(e.target.value)}
            required
            disabled={saving}
          />
        </div>

        <div className="tt-form-group">
          <label htmlFor="pf-email" className="tt-form-label">
            Correo Electrónico Corporativo
          </label>
          <input
            id="pf-email"
            type="email"
            className="tt-input"
            value={usuario.email}
            disabled
            style={{ backgroundColor: 'var(--tt-color-surface-hover)', cursor: 'not-allowed', color: 'var(--tt-color-text-muted)' }}
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)', marginTop: '0.25rem', display: 'block' }}>
            {usuario.email_verificado ? '✓ Correo verificado' : 'Correo pendiente de verificación'}
          </span>
        </div>

        <div className="tt-form-group">
          <label htmlFor="pf-telefono" className="tt-form-label">
            Teléfono de Contacto
          </label>
          <input
            id="pf-telefono"
            type="tel"
            className="tt-input"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            placeholder="+593 9..."
            disabled={saving}
          />
        </div>

        <div className="tt-form-group">
          <label htmlFor="pf-documento" className="tt-form-label">
            Documento de Identidad (RUC / Cédula)
          </label>
          <input
            id="pf-documento"
            type="text"
            className="tt-input"
            value={documento}
            onChange={(e) => setDocumento(e.target.value)}
            placeholder="Ej. 1790000000001"
            disabled={saving}
          />
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--tt-color-border)' }}>
        <button
          type="submit"
          disabled={saving}
          className="tt-btn tt-btn--primary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          {success ? <CheckCircle2 size={17} /> : <Save size={17} />}
          <span>{saving ? 'Guardando en BD...' : 'Guardar Cambios Corporativos'}</span>
        </button>
      </div>
    </form>
  );
};
