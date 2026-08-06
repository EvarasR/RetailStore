import React from 'react';
import { AccountLayout } from '../../components/account/AccountLayout';
import { ProfileForm } from '../../components/account/ProfileForm';
import { useProfile } from '../../hooks/useProfile';
import { Skeleton } from '../../components/ui/Skeleton';

export const ProfilePage: React.FC = () => {
  const { profileData, loading, updateProfile } = useProfile();

  return (
    <AccountLayout
      title="Datos Personales y Corporativos"
      subtitle="Actualiza tus nombres, apellidos, teléfono de contacto y documento fiscal (RUC/Cédula)."
    >
      <div style={{ backgroundColor: 'var(--tt-color-surface)', padding: '2rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-border)' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <Skeleton height="50px" width="100%" />
            <Skeleton height="50px" width="100%" />
            <Skeleton height="50px" width="100%" />
          </div>
        ) : profileData?.usuario ? (
          <ProfileForm usuario={profileData.usuario} onSave={updateProfile} />
        ) : (
          <p style={{ color: 'var(--tt-color-error)' }}>No se pudo cargar la información del perfil corporativo.</p>
        )}
      </div>
    </AccountLayout>
  );
};
