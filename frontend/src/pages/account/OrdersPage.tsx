import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { AccountLayout } from '../../components/account/AccountLayout';
import { OrderCard } from '../../components/account/OrderCard';
import { useOrders } from '../../hooks/useOrders';
import { Skeleton } from '../../components/ui/Skeleton';
import { Alert } from '../../components/ui/Alert';
import { Link } from 'react-router-dom';

export const OrdersPage: React.FC = () => {
  const { orders, loading, error, cancelOrder, requestOrderReturn } = useOrders();
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleCancelOrder = async (cod_pedido: number, motivo: string) => {
    try {
      await cancelOrder(cod_pedido, motivo);
      setActionMessage({ type: 'success', text: `El pedido #${cod_pedido} ha sido cancelado correctamente.` });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo cancelar el pedido.';
      setActionMessage({ type: 'error', text: msg });
      throw err;
    }
  };

  const handleReturnOrder = async (cod_pedido: number, motivo: string) => {
    try {
      const res = await requestOrderReturn(cod_pedido, motivo);
      setActionMessage({
        type: 'success',
        text: `Solicitud de devolución registrada correctamente (Folio #${res.cod_devolucion || 'DEV'}).`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo solicitar la devolución.';
      setActionMessage({ type: 'error', text: msg });
      throw err;
    }
  };

  return (
    <AccountLayout
      title="Historial de Pedidos"
      subtitle="Consulta el estado en tiempo real, rastreo logístico, cancelaciones y devoluciones permitidas en el servidor."
    >
      {error && <Alert variant="error">{error}</Alert>}
      {actionMessage && <Alert variant={actionMessage.type}>{actionMessage.text}</Alert>}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <Skeleton height="150px" width="100%" />
          <Skeleton height="150px" width="100%" />
          <Skeleton height="150px" width="100%" />
        </div>
      ) : orders.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {orders.map((ord) => (
            <OrderCard
              key={ord.cod_pedido}
              order={ord}
              onCancel={handleCancelOrder}
              onReturn={handleReturnOrder}
            />
          ))}
        </div>
      ) : (
        <div className="tt-empty-state" style={{ padding: '4rem 1rem', textAlign: 'center', backgroundColor: 'var(--tt-color-surface)', borderRadius: '0.75rem', border: '1px dashed var(--tt-color-border)' }}>
          <ShoppingBag size={44} color="var(--tt-color-text-light)" style={{ margin: '0 auto 1rem' }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Aún no tienes pedidos</h3>
          <p style={{ color: 'var(--tt-color-text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
            Explora nuestro catálogo corporativo de tecnología y herramientas industriales para realizar tu primera orden.
          </p>
          <Link to="/catalogo" className="tt-btn tt-btn--primary">
            Explorar Catálogo TechTail
          </Link>
        </div>
      )}
    </AccountLayout>
  );
};
