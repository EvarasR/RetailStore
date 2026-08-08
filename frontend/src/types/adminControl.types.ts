export interface AdminControlUser {
  cod_usuario: number;
  email: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  verificado: boolean;
  activo: boolean;
  roles: string[];
  fecha: string;
}

export interface AdminControlRole {
  cod_rol: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  permisos?: string[];
}

export interface AdminControlPermission {
  cod_permiso: number;
  codigo: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

export interface AdminControlAuditLog {
  cod_registro: number;
  usuario: string;
  accion: string;
  modulo: string;
  ip: string;
  fecha: string;
}

export interface AdminControlAbandonedCart {
  cod_carrito: number;
  usuario: string;
  valor: string;
  items: number;
  fecha: string;
}

export interface AdminControlResponse {
  usuarios?: AdminControlUser[];
  roles?: AdminControlRole[];
  permisos?: AdminControlPermission[];
  registros?: AdminControlAuditLog[];
  carritos_abandonados?: Array<AdminControlAbandonedCart | { cod_carrito: number; cliente: string; total: string; fecha: string }>;
  auditoria?: Array<{ cod_auditoria: number; tabla: string; operacion: string; registro: number; usuario_bd: string; fecha: string }>;
}
