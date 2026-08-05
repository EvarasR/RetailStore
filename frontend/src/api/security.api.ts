import { postForm } from './http';
import type { PasswordChangePayload, SecurityActionResponse } from '../types/security.types';

export async function changePassword(payload: PasswordChangePayload): Promise<SecurityActionResponse> {
  const res = await postForm('/api/seguridad/password/', {
    password_actual: payload.password_actual,
    password_nueva: payload.password_nueva,
    password_confirmacion: payload.password_confirmacion,
  });
  return res as SecurityActionResponse;
}

export async function verifyEmail(): Promise<SecurityActionResponse> {
  const res = await postForm('/api/seguridad/verificar-email/', {
    confirmar: '1',
  });
  return res as SecurityActionResponse;
}
