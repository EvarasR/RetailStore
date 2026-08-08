import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Truck, XCircle, RotateCcw, Calendar } from 'lucide-react';
import type { OrderSummaryItem } from '../../types/order.types';
import { OrderStatusBadge } from './OrderStatusBadge';

interface OrderCardProps {
  order: OrderSummaryItem;
  onCancel?: (cod_pedido: number, motivo: string) => Promise<unknown>;
  onReturn?: (cod_pedido: number, motivo: string) => Promise<unknown>;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  order,
  onCancel,
  onReturn,
}) => {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [motivo, setMotivo] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onCancel || !motivo.trim()) return;
    setLoadingAction(true);
    try {
      await onCancel(order.cod_pedido, motivo.trim());
      setShowCancelModal(false);
      setMotivo('');
    } finally {
      setLoadingAction(false);
    }
  };

  const handleReturnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onReturn || !motivo.trim()) return;
    setLoadingAction(true);
    try {
      await onReturn(order.cod_pedido, motivo.trim());
      setShowReturnModal(false);
      setMotivo('');
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="tt-order-card">
      <div className="tt-order-card__header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <ShoppingBag size={19} color="var(--tt-color-primary)" />
          <div>
            <span className="tt-order-card__id">Pedido #{order.numero_pedido || order.cod_pedido}</span>
            <span className="tt-order-card__date" style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.75rem', color: 'var(--tt-color-text-light)' }}>
              <Calendar size={13} /> {order.fecha}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <OrderStatusBadge estado={order.estado} nombre={order.estado_nombre} />
          <span className="tt-order-card__total">{order.total}</span>
        </div>
      </div>

      <div className="tt-order-card__body">
        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--tt-color-text-muted)' }}>
          {order.requiere_abastecimiento
            ? '⚡ Pedido sujeto a abastecimiento logístico prioritario de proveedor TechTail.'
            : '✓ Productos con stock verificado en centros logísticos locales.'}
        </p>
      </div>

      <div className="tt-order-card__footer">
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <Link to={`/cuenta/pedidos/${order.cod_pedido}`} className="tt-btn tt-btn--secondary" style={{ fontSize: '0.8125rem', padding: '0.4rem 0.8rem' }}>
            <span>Ver Detalle de Ítems</span>
          </Link>
          <Link to={`/cuenta/tracking/${order.cod_pedido}`} className="tt-btn tt-btn--primary" style={{ fontSize: '0.8125rem', padding: '0.4rem 0.8rem' }}>
            <Truck size={15} />
            <span>Rastrear Envío</span>
          </Link>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto' }}>
          {order.puede_cancelar && onCancel && (
            <button
              type="button"
              onClick={() => setShowCancelModal(true)}
              className="tt-btn tt-btn--danger"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem' }}
            >
              <XCircle size={14} />
              <span>Cancelar Pedido</span>
            </button>
          )}

          {order.puede_devolver && onReturn && (
            <button
              type="button"
              onClick={() => setShowReturnModal(true)}
              className="tt-btn tt-btn--ghost"
              style={{ fontSize: '0.75rem', padding: '0.35rem 0.7rem', color: 'var(--tt-color-text-main)' }}
            >
              <RotateCcw size={14} />
              <span>Solicitar Devolución</span>
            </button>
          )}
        </div>
      </div>

      {/* Modal de Cancelación */}
      {showCancelModal && (
        <div className="tt-modal-backdrop" role="dialog" aria-modal="true">
          <div className="tt-modal" style={{ maxWidth: '440px' }}>
            <div className="tt-modal__header">
              <h3 className="tt-modal__title">Cancelar Pedido #{order.numero_pedido || order.cod_pedido}</h3>
              <button type="button" onClick={() => setShowCancelModal(false)} className="tt-modal__close">
                ×
              </button>
            </div>
            <form onSubmit={handleCancelSubmit} className="tt-modal__body">
              <p style={{ fontSize: '0.875rem', color: 'var(--tt-color-text-muted)', margin: '0 0 1rem 0' }}>
                ¿Deseas cancelar esta orden en el servidor TechTail? Por favor indícanos el motivo:
              </p>
              <input
                type="text"
                className="tt-input"
                placeholder="Ej. Cambio de dirección, error en el pedido"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShowCancelModal(false)} className="tt-btn tt-btn--secondary" disabled={loadingAction}>
                  Volver
                </button>
                <button type="submit" className="tt-btn tt-btn--danger" disabled={loadingAction}>
                  {loadingAction ? 'Cancelando...' : 'Confirmar Cancelación'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Devolución */}
      {showReturnModal && (
        <div className="tt-modal-backdrop" role="dialog" aria-modal="true">
          <div className="tt-modal" style={{ maxWidth: '440px' }}>
            <div className="tt-modal__header">
              <h3 className="tt-modal__title">Solicitar Devolución #{order.numero_pedido || order.cod_pedido}</h3>
              <button type="button" onClick={() => setShowReturnModal(false)} className="tt-modal__close">
                ×
              </button>
            </div>
            <form onSubmit={handleReturnSubmit} className="tt-modal__body">
              <p style={{ fontSize: '0.875rem', color: 'var(--tt-color-text-muted)', margin: '0 0 1rem 0' }}>
                ¿Cuál es el motivo de la devolución? Nuestro almacén validará la solicitud.
              </p>
              <input
                type="text"
                className="tt-input"
                placeholder="Ej. Producto defectuoso o no corresponde al solicitado"
                value={motivo}
                onChange={(e) => setMotivo(e.target.value)}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.25rem' }}>
                <button type="button" onClick={() => setShowReturnModal(false)} className="tt-btn tt-btn--secondary" disabled={loadingAction}>
                  Volver
                </button>
                <button type="submit" className="tt-btn tt-btn--primary" disabled={loadingAction}>
                  {loadingAction ? 'Enviando...' : 'Confirmar Devolución'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
