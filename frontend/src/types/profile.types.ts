/**
 * Tipos oficiales de Perfil en TechTail Enterprise (DB-First)
 * devueltos por GET /api/perfil/
 */

export interface UserProfileData {
  cod_usuario: number;
  email: string;
  nombres: string;
  apellidos: string;
  telefono?: string | null;
  documento_identidad?: string | null;
  email_verificado: boolean;
  activo: boolean;
  ultimo_login?: string | null;
}

export interface UserProfilePreferences {
  acepta_marketing: boolean;
  idioma_preferido: string;
  moneda_preferida: string;
}

export interface ProfileResponse {
  ok: boolean;
  usuario: UserProfileData;
  perfil: UserProfilePreferences;
}

export interface UpdateProfilePayload {
  nombres: string;
  apellidos: string;
  telefono?: string;
  documento_identidad?: string;
}
