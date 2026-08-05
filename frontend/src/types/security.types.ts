export interface PasswordChangePayload {
  password_actual: string;
  password_nueva: string;
  password_confirmacion: string;
}

export interface SecurityActionResponse {
  ok: boolean;
  mensaje: string;
}
