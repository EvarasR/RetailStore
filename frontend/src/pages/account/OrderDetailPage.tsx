import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Truck, ShoppingBag } from 'lucide-react';
import { AccountLayout } from '../../components/account/AccountLayout';
import { OrderStatusBadge } from '../../components/account/OrderStatusBadge';
import { useOrders } from '../../hooks/useOrders';
import { Skeleton } from '../../components/ui/Skeleton';
import { Alert } from '../../components/ui/Alert';
import type { OrderDetailResponse } from '../../types/order.types';

export const OrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getOrderDetail } = useOrders();
  const [detail, setDetail] = useState<OrderDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);
    setError(null);
    getOrderDetail(id)
      .then((res) => {
        if (isMounted) setDetail(res);
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const msg = err instanceof Error ? err.message : 'Error al cargar detalle de pedido.';
          setError(msg);
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, [id, getOrderDetail]);

  const pedido = detail?.pedido;
  const items = detail?.items || [];

  return (
    <AccountLayout
      title={pedido ? `Detalle del Pedido #${pedido.numero_pedido || pedido.cod_pedido}` : 'Detalle de Pedido'}
      subtitle="Desglose fiscal de ítems, precios oficiales de base de datos e importes totales."
    >
      <div style={{ marginBottom: '1.5rem' }}>
        <Link
          to="/cuenta/pedidos"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--tt-color-primary)', fontWeight: 600, fontSize: '0.875rem' }}
        >
          <ArrowLeft size={16} />
          <span>Volver al listado de pedidos</span>
        </Link>
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Skeleton height="80px" width="100%" />
          <Skeleton height="300px" width="100%" />
        </div>
      ) : pedido ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Encabezado del pedido */}
          <div
            style={{
              backgroundColor: 'var(--tt-color-surface)',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--tt-color-border)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem',
            }}
          >
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)', display: 'block' }}>NÚMERO DE COMPRA</span>
              <strong style={{ fontSize: '1.25rem', color: 'var(--tt-color-text-main)' }}>
                #{pedido.numero_pedido || pedido.cod_pedido}
              </strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <OrderStatusBadge estado={pedido.estado} />
              <Link
                to={`/cuenta/tracking/${pedido.cod_pedido}`}
                className="tt-btn tt-btn--primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem' }}
              >
                <Truck size={16} />
                <span>Rastrear Envío</span>
              </Link>
            </div>
          </div>

          {/* Tabla de ítems DB-First */}
          <div
            style={{
              backgroundColor: 'var(--tt-color-surface)',
              borderRadius: '0.75rem',
              border: '1px solid var(--tt-color-border)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--tt-color-border)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <ShoppingBag size={18} color="var(--tt-color-primary)" />
              <span>Productos en este pedido</span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--tt-color-surface-hover)', fontSize: '0.75rem', color: 'var(--tt-color-text-light)', textTransform: 'uppercase' }}>
                    <th style={{ padding: '0.75rem 1.5rem' }}>Producto</th>
                    <th style={{ padding: '0.75rem 1.5rem', textAlign: 'center' }}>Cantidad</th>
                    <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right' }}>Precio Unitario</th>
                    <th style={{ padding: '0.75rem 1.5rem', textAlign: 'right' }}>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} style={{ borderTop: '1px solid var(--tt-color-border)' }}>
                      <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--tt-color-text-main)' }}>{item.producto}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'center', fontWeight: 600 }}>{item.cantidad}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right', color: 'var(--tt-color-text-muted)' }}>{item.precio_unitario}</td>
                      <td style={{ padding: '1rem 1.5rem', textAlign: 'right', fontWeight: 700, color: 'var(--tt-color-text-main)' }}>{item.subtotal}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totales y desglose fiscal DB-First */}
          <div
            style={{
              backgroundColor: 'var(--tt-color-surface)',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--tt-color-border)',
              alignSelf: 'flex-end',
              width: '100%',
              maxWidth: '380px',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--tt-color-text-muted)' }}>
                <span>Subtotal:</span>
                <span>{pedido.subtotal}</span>
              </div>
              {pedido.descuento && (
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--tt-color-primary)' }}>
                  <span>Descuento aplicado:</span>
                  <span>-{pedido.descuento}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--tt-color-text-muted)' }}>
                <span>Costo de envío logístico:</span>
                <span>{pedido.costo_envio}</span>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '1.15rem',
                  fontWeight: 800,
                  color: 'var(--tt-color-text-main)',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid var(--tt-color-border)',
                  marginTop: '0.25rem',
                }}
              >
                <span>Total pagado:</span>
                <span style={{ color: 'var(--tt-color-primary)' }}>{pedido.total}</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p style={{ color: 'var(--tt-color-text-muted)' }}>No se encontró el detalle de este pedido.</p>
      )}
    </AccountLayout>
  );
};
