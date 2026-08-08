import React, { useCallback, useState } from 'react';
import { Link2, Unlink } from 'lucide-react';
import { unlinkGoogle, type GoogleSecurityState } from '../../api/googleAuth.api';
import { GoogleButton } from '../auth/GoogleButton';

interface Props {
  state: GoogleSecurityState | null;
  reload: () => Promise<void>;
}

export const GoogleSecurityCard: React.FC<Props> = ({ state, reload }) => {
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const linked = Boolean(state?.google_vinculado);
  const handleSuccess = useCallback(async () => {
    setMessage('Google quedó vinculado a tu cuenta.');
    setError(null);
    await reload();
  }, [reload]);
  const handleError = useCallback((value: string) => setError(value), []);
  const handleUnlink = async () => {
    setError(null);
    try {
      const result = await unlinkGoogle();
      setMessage(result.mensaje);
      await reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudo desvincular Google.');
    }
  };
  return (
    <div className="tt-card" style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap' }}>
        <div><h3 style={{ margin: 0 }}>Métodos de inicio de sesión</h3><p style={{ margin: '.4rem 0 0', color: 'var(--tt-color-text-muted)' }}>Contraseña: {state?.password_configurada ? 'Configurada' : 'No configurada'} · Google: {linked ? 'Vinculado' : 'No vinculado'}</p></div>
        {linked && <span className="tt-badge tt-badge--success">{state?.google_email}</span>}
      </div>
      {message && <div role="status" style={{ color: 'var(--tt-color-success)' }}>{message}</div>}
      {error && <div role="alert" style={{ color: 'var(--tt-color-error)' }}>{error}</div>}
      {linked ? (
        <button type="button" className="tt-btn tt-btn--secondary" onClick={handleUnlink} disabled={!state?.password_configurada} style={{ justifySelf: 'start' }}>
          <Unlink size={16} /> Desvincular Google
        </button>
      ) : (
        <div style={{ maxWidth: 340 }}><Link2 size={17} /> <GoogleButton mode="link" onSuccess={handleSuccess} onError={handleError} /></div>
      )}
      {linked && !state?.password_configurada && <small>Configura una contraseña antes de desvincular Google para no perder el acceso.</small>}
    </div>
  );
};
