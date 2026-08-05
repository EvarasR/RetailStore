export interface AdminTrackingShipment {
  cod_envio: number;
  pedido: string;
  tracking: string;
  estado: string;
  transportista: string | null;
  entrega: string;
}

export interface AdminTrackingSchedule {
  cod_programacion: number;
  cod_envio: number;
  evento: string;
  descripcion: string;
  fecha_programada: string;
  procesado: boolean;
  orden: number;
}

export interface AdminTrackingResponse {
  envios: AdminTrackingShipment[];
  programaciones: AdminTrackingSchedule[];
}
