import React from 'react';
import { CheckCircle, ExternalLink, Info, AlertTriangle, ShieldAlert } from 'lucide-react';
import type { NotificationItem } from '../../types/notification.types';

interface NotificationCardProps {
  notification: NotificationItem;
  onMarkRead: (cod_notificacion: number) => Promise<void>;
}

export const NotificationCard: React.FC<NotificationCardProps> = ({
  notification,
  onMarkRead,
}) => {
  const { cod_notificacion, tipo, titulo, mensaje, url_accion, leida, fecha } = notification;

  const getIcon = () => {
    switch (tipo?.toUpperCase()) {
      case 'ALERTA':
      case 'WARNING':
        return <AlertTriangle size={20} color="var(--tt-color-warning)" />;
      case 'SEGURIDAD':
      case 'ERROR':
        return <ShieldAlert size={20} color="var(--tt-color-error)" />;
      case 'EXIF':
      case 'SUCCESS':
        return <CheckCircle size={20} color="var(--tt-color-success)" />;
      default:
        return <Info size={20} color="var(--tt-color-primary)" />;
    }
  };

  return (
    <div
      className={`tt-notification-card ${leida ? 'tt-notification-card--read' : 'tt-notification-card--unread'}`}
    >
      <div className="tt-notification-card__icon">{getIcon()}</div>

      <div className="tt-notification-card__body">
        <div className="tt-notification-card__header">
          <h4 className="tt-notification-card__title">{titulo}</h4>
          {fecha && <span className="tt-notification-card__date">{fecha}</span>}
        </div>

        <p className="tt-notification-card__message">{mensaje}</p>

        <div className="tt-notification-card__actions">
          {url_accion && (
            <a
              href={url_accion}
              className="tt-btn tt-btn--secondary"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem' }}
            >
              <ExternalLink size={13} />
              <span>Ver detalle de acción</span>
            </a>
          )}

          {!leida && (
            <button
              type="button"
              onClick={() => onMarkRead(cod_notificacion)}
              className="tt-btn tt-btn--ghost"
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.65rem', marginLeft: 'auto' }}
            >
              <CheckCircle size={14} />
              <span>Marcar como leída</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
