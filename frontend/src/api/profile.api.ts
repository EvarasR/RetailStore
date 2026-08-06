import { getJSON, postForm } from './http';
import type { ProfileResponse } from '../types/profile.types';

/**
 * Consulta el perfil del usuario autenticado en /api/perfil/
 */
export async function fetchProfile(): Promise<ProfileResponse> {
  return getJSON<ProfileResponse>('/api/perfil/');
}

/**
 * Actualiza los datos del perfil corporativo vía POST /api/perfil/actualizar/
 */
export async function updateProfile(data: Record<string, string>): Promise<{ ok: boolean; mensaje: string }> {
  const res = await postForm<{ ok?: boolean; mensaje?: string }>('/api/perfil/actualizar/', data);
  return {
    ok: Boolean(res?.ok !== false),
    mensaje: String(res?.mensaje || 'Perfil actualizado exitosamente.'),
  };
}
