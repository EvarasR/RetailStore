import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { AccountLayout } from '../../components/account/AccountLayout';
import { OrderTimeline } from '../../components/account/OrderTimeline';
import { useOrders } from '../../hooks/useOrders';
import { Skeleton } from '../../components/ui/Skeleton';
import { Alert } from '../../components/ui/Alert';
import type { OrderTrackingResponse } from '../../types/order.types';

export const TrackingPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getOrderTracking } = useOrders();
  const [tracking, setTracking] = useState<OrderTrackingResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);
    setError(null);
    getOrderTracking(id)
      .then((res) => {
        if (isMounted) setTracking(res);
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Error al cargar seguimiento logístico.';
          setError(msg);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id, getOrderTracking]);

  return (
    <AccountLayout
      title={`Seguimiento del Pedido #${id}`}
      subtitle="Rastreo en tiempo real, hitos logísticos y fecha estimada de entrega TechTail."
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to={`/cuenta/pedidos/${id}`}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--tt-color-primary)', fontWeight: 600, fontSize: '0.875rem' }}
        >
          <ArrowLeft size={16} />
          <span>Volver al detalle del pedido</span>
        </Link>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      <div style={{ backgroundColor: 'var(--tt-color-surface)', padding: '2rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-border)' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <Skeleton height="60px" width="100%" />
            <Skeleton height="15px" width="100%" />
            <Skeleton height="250px" width="100%" />
          </div>
        ) : tracking?.envio ? (
          <OrderTimeline tracking={tracking} />
        ) : (
          <p style={{ color: 'var(--tt-color-error)' }}>No se pudo consultar el rastreo logístico de esta compra.</p>
        )}
      </div>
    </AccountLayout>
  );
};
