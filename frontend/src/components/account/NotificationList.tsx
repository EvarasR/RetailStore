import React from 'react';
import { BellOff } from 'lucide-react';
import type { NotificationItem } from '../../types/notification.types';
import { NotificationCard } from './NotificationCard';
import { Skeleton } from '../ui/Skeleton';

interface NotificationListProps {
  notifications: NotificationItem[];
  loading: boolean;
  onMarkRead: (cod_notificacion: number) => Promise<void>;
}

export const NotificationList: React.FC<NotificationListProps> = ({
  notifications,
  loading,
  onMarkRead,
}) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Skeleton height="90px" width="100%" />
        <Skeleton height="90px" width="100%" />
        <Skeleton height="90px" width="100%" />
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="tt-empty-state" style={{ padding: '3.5rem 1.5rem', textAlign: 'center', backgroundColor: 'var(--tt-color-surface)', borderRadius: '0.75rem', border: '1px dashed var(--tt-color-border)' }}>
        <BellOff size={40} color="var(--tt-color-text-light)" style={{ margin: '0 auto 0.75rem' }} />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>No tienes notificaciones</h3>
        <p style={{ color: 'var(--tt-color-text-muted)', maxWidth: '420px', margin: '0 auto', fontSize: '0.875rem' }}>
          Aquí aparecerán avisos sobre el estado logístico de tus pedidos, promociones corporativas y alertas de seguridad.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {notifications.map((item) => (
        <NotificationCard
          key={item.cod_notificacion}
          notification={item}
          onMarkRead={onMarkRead}
        />
      ))}
    </div>
  );
};
