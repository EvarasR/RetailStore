import { getJSON, postForm } from './http';

export interface NotificationPreferences {
  notificaciones_web: boolean;
  emails_pedidos: boolean;
  emails_descuentos: boolean;
  emails_prime: boolean;
  emails_soporte: boolean;
}

export async function fetchNotificationPreferences() {
  const result = await getJSON<{ ok: boolean; preferencias: NotificationPreferences }>('/operaciones/api/preferencias-notificacion/');
  return result.preferencias;
}

export async function saveNotificationPreferences(preferences: NotificationPreferences) {
  return postForm<{ ok: boolean; mensaje: string; preferencias: NotificationPreferences }>(
    '/operaciones/api/preferencias-notificacion/', { ...preferences },
  );
}
