import { useState, useEffect, useCallback } from 'react';
import { fetchNotifications, markNotificationAsRead } from '../api/notifications.api';
import type { NotificationItem } from '../types/notification.types';

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchNotifications();
      if (res.ok) {
        setNotifications(res.notificaciones || []);
      } else {
        setError('No se pudieron cargar las notificaciones.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar notificaciones.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (cod_notificacion: number) => {
    try {
      await markNotificationAsRead(cod_notificacion);
      setNotifications((prev) =>
        prev.map((n) =>
          n.cod_notificacion === cod_notificacion ? { ...n, leida: true } : n
        )
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo marcar la notificación como leída.';
      throw new Error(msg);
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const unreadCount = notifications.filter((n) => !n.leida).length;

  return {
    notifications,
    loading,
    error,
    unreadCount,
    loadNotifications,
    markAsRead,
  };
}
