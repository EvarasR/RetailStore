import React, { useEffect, useState } from 'react';
import { AccountLayout } from '../../components/account/AccountLayout';
import { fetchNotificationPreferences, saveNotificationPreferences, type NotificationPreferences } from '../../api/preferences.api';

const labels: Record<keyof NotificationPreferences, string> = {
  notificaciones_web: 'Notificaciones web',
  emails_pedidos: 'Emails de pedidos y facturas',
  emails_prime: 'Emails de membresía Prime',
  emails_soporte: 'Emails de soporte',
};

export const PreferencesPage: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    fetchNotificationPreferences().then(setPreferences).catch((reason) => setError(reason instanceof Error ? reason.message : 'No se pudieron cargar las preferencias.'));
  }, []);
  const save = async () => {
    if (!preferences) return;
    setError(null);
    try {
      const result = await saveNotificationPreferences(preferences);
      setMessage(result.mensaje);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'No se pudieron guardar las preferencias.');
    }
  };
  return (
    <AccountLayout title="Preferencias de notificación" subtitle="Elige qué comunicaciones deseas recibir. Las facturas siempre permanecen disponibles en tu cuenta.">
      <div className="tt-card" style={{ padding: '1.5rem', maxWidth: 680, display: 'grid', gap: '1rem' }}>
        {error && <div role="alert" style={{ color: 'var(--tt-color-error)' }}>{error}</div>}
        {message && <div role="status" style={{ color: 'var(--tt-color-success)' }}>{message}</div>}
        {!preferences ? <p>Cargando preferencias...</p> : Object.entries(labels).map(([key, label]) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem', padding: '.8rem 0', borderBottom: '1px solid var(--tt-color-border)' }}>
            <span>{label}</span>
            <input type="checkbox" checked={preferences[key as keyof NotificationPreferences]} onChange={(event) => setPreferences({ ...preferences, [key]: event.target.checked })} />
          </label>
        ))}
        <button type="button" className="tt-btn tt-btn--primary" onClick={save} disabled={!preferences} style={{ justifySelf: 'start' }}>Guardar preferencias</button>
      </div>
    </AccountLayout>
  );
};
