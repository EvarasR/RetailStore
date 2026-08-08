import { getJSON, postJSON } from './http';
import type { SessionState } from '../types/user.types';

export interface GooglePrepareResponse {
  ok: boolean;
  state: string;
  nonce: string;
  client_id: string;
}

export interface GoogleAuthResponse extends Partial<SessionState> {
  ok: boolean;
  redirect?: string | null;
  onboarding_requerido?: boolean;
  vinculado?: boolean;
  mensaje?: string;
}

export interface GoogleSecurityState {
  ok: boolean;
  password_configurada: boolean;
  google_vinculado: boolean;
  google_email?: string | null;
}

export function prepareGoogle(mode: 'login' | 'link', next?: string | null) {
  return postJSON<GooglePrepareResponse>('/api/auth/google/preparar/', { mode, next });
}

export function authenticateGoogle(credential: string, state: string) {
  return postJSON<GoogleAuthResponse>('/api/auth/google/autenticar/', { credential, state }, { skipSessionExpiredHandling: true });
}

export function completeGoogleRegistration(payload: Record<string, unknown>) {
  return postJSON<GoogleAuthResponse>('/api/auth/google/completar/', payload, { skipSessionExpiredHandling: true });
}

export function fetchGoogleSecurity() {
  return getJSON<GoogleSecurityState>('/api/seguridad/google/');
}

export function unlinkGoogle() {
  return postJSON<{ ok: boolean; mensaje: string }>('/api/seguridad/google/desvincular/', {});
}
