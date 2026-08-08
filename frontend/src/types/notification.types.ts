export interface NotificationItem {
  cod_notificacion: number;
  tipo: string;
  titulo: string;
  mensaje: string;
  url_accion?: string | null;
  leida: boolean;
  fecha?: string | null;
  referencia_tipo?: string | null;
  referencia_id?: number | null;
  cod_producto?: number | null;
}

export interface NotificationsResponse {
  ok: boolean;
  notificaciones: NotificationItem[];
}
