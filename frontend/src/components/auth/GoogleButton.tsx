import React, { useEffect, useRef, useState } from 'react';
import { authenticateGoogle, prepareGoogle, type GoogleAuthResponse } from '../../api/googleAuth.api';
import { HttpError } from '../../api/http';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (options: Record<string, unknown>) => void;
          renderButton: (element: HTMLElement, options: Record<string, unknown>) => void;
          cancel: () => void;
        };
      };
    };
  }
}

let googleScriptPromise: Promise<void> | null = null;

function loadGoogleScript() {
  if (window.google?.accounts.id) return Promise.resolve();
  if (googleScriptPromise) return googleScriptPromise;
  googleScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>('script[data-techtail-google]');
    if (existing) {
      existing.addEventListener('load', () => resolve(), { once: true });
      existing.addEventListener('error', () => reject(new Error('NETWORK_ERROR')), { once: true });
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.dataset.techtailGoogle = 'true';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('NETWORK_ERROR'));
    document.head.appendChild(script);
  });
  return googleScriptPromise;
}

function googleErrorMessage(error: unknown) {
  if (error instanceof HttpError && error.payload && typeof error.payload === 'object' && 'codigo' in error.payload) {
    const code = String(error.payload.codigo);
    const messages: Record<string, string> = {
      GOOGLE_NOT_CONFIGURED: 'El acceso con Google aún no está configurado.',
      GOOGLE_INVALID_STATE: 'La validación de seguridad de Google expiró. Inténtalo nuevamente.',
      GOOGLE_LINK_REQUIRED: 'Inicia sesión con tu contraseña y vincula Google desde tu cuenta.',
      GOOGLE_ALREADY_LINKED: 'Esta cuenta Google ya está vinculada.',
    };
    if (messages[code]) return messages[code];
  }
  return error instanceof Error ? error.message : 'Google no está disponible.';
}

interface Props {
  mode?: 'login' | 'link';
  next?: string | null;
  onSuccess: (response: GoogleAuthResponse) => void | Promise<void>;
  onError: (message: string) => void;
}

export const GoogleButton: React.FC<Props> = ({ mode = 'login', next, onSuccess, onError }) => {
  const container = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let active = true;
    let preparedState = '';
    const setup = async () => {
      try {
        const prepared = await prepareGoogle(mode, next);
        preparedState = prepared.state;
        const viteClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
        if (viteClientId && viteClientId !== 'CHANGE_ME' && viteClientId !== prepared.client_id) {
          throw new Error('La configuración Google del frontend y backend no coincide.');
        }
        await loadGoogleScript();
        if (!active || !container.current || !window.google) return;
        window.google.accounts.id.initialize({
          client_id: prepared.client_id,
          nonce: prepared.nonce,
          ux_mode: 'popup',
          context: mode === 'link' ? 'use' : 'signin',
          callback: async ({ credential }: { credential?: string }) => {
            if (!credential) {
              onError('Inicio con Google cancelado.');
              return;
            }
            try {
              const result = await authenticateGoogle(credential, preparedState);
              await onSuccess(result);
            } catch (error) {
              onError(error instanceof Error ? error.message : 'No se pudo iniciar sesión con Google.');
            }
          },
        });
        container.current.replaceChildren();
        window.google.accounts.id.renderButton(container.current, {
          type: 'standard', theme: 'outline', size: 'large', text: 'continue_with',
          shape: 'rectangular', width: container.current.clientWidth || 320,
        });
      } catch (error) {
        if (active) {
          setUnavailable(true);
          onError(googleErrorMessage(error));
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    void setup();
    return () => {
      active = false;
      window.google?.accounts.id.cancel();
    };
  }, [mode, next, onError, onSuccess]);

  return (
    <div className="tt-google-auth">
      {loading && <button type="button" className="tt-btn tt-btn--secondary" disabled>Cargando Google...</button>}
      {!loading && unavailable && <button type="button" className="tt-btn tt-btn--secondary" disabled style={{ width: '100%' }}>G&nbsp;&nbsp; Continuar con Google</button>}
      <div ref={container} aria-label="Continuar con Google" style={{ minHeight: loading ? 0 : 40 }} />
    </div>
  );
};
