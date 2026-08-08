import React, { useCallback, useEffect, useState } from 'react';
import { AccountLayout } from '../../components/account/AccountLayout';
import { SecurityPanel } from '../../components/account/SecurityPanel';
import { useSecurity } from '../../hooks/useSecurity';
import { useAuth } from '../../hooks/useAuth';
import { fetchGoogleSecurity, type GoogleSecurityState } from '../../api/googleAuth.api';

export const SecurityPage: React.FC = () => {
  const { changeUserPassword, verifyUserEmail } = useSecurity();
  const { usuario, roles, logout } = useAuth();
  const [googleState, setGoogleState] = useState<GoogleSecurityState | null>(null);
  const reloadGoogleState = useCallback(async () => {
    setGoogleState(await fetchGoogleSecurity());
  }, []);
  useEffect(() => { void reloadGoogleState(); }, [reloadGoogleState]);

  return (
    <AccountLayout
      title="Configuración de Seguridad y Credenciales"
      subtitle="Administración segura de acceso, cambio de contraseña institucional y verificación fiscal de correo."
    >
      <SecurityPanel
        email={usuario?.email}
        isVerified={true}
        userFullName={usuario?.nombre_completo || usuario?.nombres || 'Usuario TechTail'}
        userRole={roles?.[0] || 'CUSTOMER'}
        onChangePassword={changeUserPassword}
        onVerifyEmail={verifyUserEmail}
        onLogout={logout}
        googleState={googleState}
        reloadGoogleState={reloadGoogleState}
      />
    </AccountLayout>
  );
};
