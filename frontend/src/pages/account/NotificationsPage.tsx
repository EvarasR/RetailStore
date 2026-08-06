import React from 'react';
import { AccountLayout } from '../../components/account/AccountLayout';
import { NotificationList } from '../../components/account/NotificationList';
import { useNotifications } from '../../hooks/useNotifications';
import { Alert } from '../../components/ui/Alert';

export const NotificationsPage: React.FC = () => {
  const { notifications, loading, error, markAsRead } = useNotifications();

  return (
    <AccountLayout
      title="Notificaciones Corporativas"
      subtitle="Avisos oficiales sobre el estado logístico de tus pedidos, cotizaciones y alertas de seguridad."
    >
      {error && <Alert variant="error">{error}</Alert>}

      <NotificationList
        notifications={notifications}
        loading={loading}
        onMarkRead={markAsRead}
      />
    </AccountLayout>
  );
};
