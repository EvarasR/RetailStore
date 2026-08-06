import { useCallback } from 'react';
import { changePassword, verifyEmail } from '../api/security.api';
import type { PasswordChangePayload } from '../types/security.types';

export function useSecurity() {
  const changeUserPassword = useCallback(async (payload: PasswordChangePayload) => {
    const res = await changePassword(payload);
    if (!res.ok) {
      throw new Error(res.mensaje || 'Error al actualizar la contraseña en el servidor.');
    }
    return res;
  }, []);

  const verifyUserEmail = useCallback(async () => {
    const res = await verifyEmail();
    if (!res.ok) {
      throw new Error(res.mensaje || 'Error al verificar correo electrónico en el servidor.');
    }
    return res;
  }, []);

  return {
    changeUserPassword,
    verifyUserEmail,
  };
}
