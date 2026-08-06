import { getJSON, postForm } from './http';
import type { NotificationsResponse } from '../types/notification.types';

export async function fetchNotifications(): Promise<NotificationsResponse> {
  const data = await getJSON<NotificationsResponse>('/operaciones/api/notificaciones/');
  return data;
}

export async function markNotificationAsRead(cod_notificacion: number): Promise<{ ok: boolean; mensaje: string }> {
  const res = await postForm(`/operaciones/api/notificaciones/${cod_notificacion}/leer/`, {});
  return res as { ok: boolean; mensaje: string };
}
