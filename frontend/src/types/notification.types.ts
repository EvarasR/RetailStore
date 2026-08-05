export interface NotificationItem {
  cod_notificacion: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  url_accion?: string | null;
  leida: boolean;
  fecha?: string | null;
}

export interface NotificationsResponse {
  ok: boolean;
  notificaciones: NotificationItem[];
}
