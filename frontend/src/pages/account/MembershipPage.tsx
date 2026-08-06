import React from 'react';
import { AccountLayout } from '../../components/account/AccountLayout';
import { MembershipPanel } from '../../components/account/MembershipPanel';
import { useMembership } from '../../hooks/useMembership';
import { Alert } from '../../components/ui/Alert';
import { Skeleton } from '../../components/ui/Skeleton';

export const MembershipPage: React.FC = () => {
  const {
    membership,
    planes,
    pagos,
    metodosPago,
    loading,
    error,
    payPrime,
    cancelPrime,
  } = useMembership();

  return (
    <AccountLayout
      title="Membresía TechTail Prime Enterprise"
      subtitle="Suscripción corporativa para despachos sin costo logístico, descuentos empresariales y soporte prioritario."
    >
      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <Skeleton height="180px" width="100%" />
          <Skeleton height="300px" width="100%" />
        </div>
      ) : (
        <MembershipPanel
          membership={membership}
          planes={planes}
          pagos={pagos}
          metodosPago={metodosPago}
          onPay={payPrime}
          onCancel={cancelPrime}
          loading={loading}
        />
      )}
    </AccountLayout>
  );
};
