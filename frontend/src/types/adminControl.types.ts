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
  registros?: AdminControlAuditLog[];
  carritos_abandonados?: AdminControlAbandonedCart[];
}
