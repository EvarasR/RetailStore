/**
 * Tipos de sesión y usuario retornados por Django DB-First (/api/session/)
 */
export interface UsuarioPerfil {
  cod_usuario: number;
  email: string;
  nombres: string;
  apellidos: string;
  nombre_completo: string;
}

export interface SessionState {
  autenticado: boolean;
  es_admin: boolean;
  es_prime: boolean;
  es_proveedor_externo: boolean;
  cod_proveedor?: number | null;
  roles: string[];
  usuario?: UsuarioPerfil | null;
  loading: boolean;
  error?: string | null;
}
