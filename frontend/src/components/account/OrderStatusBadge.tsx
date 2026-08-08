import React from 'react';

interface OrderStatusBadgeProps {
  estado: string;
  nombre?: string;
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ estado, nombre }) => {
  const code = estado ? estado.toUpperCase() : 'CREADO';

  const getBadgeStyle = (st: string): { bg: string; color: string; label: string } => {
    switch (st) {
      case 'ENTREGADO':
        return { bg: 'rgba(16, 185, 129, 0.15)', color: 'var(--tt-color-success)', label: nombre || 'Entregado' };
      case 'EN_TRANSITO':
      case 'ENVIADO':
      case 'EN_REPARTO':
      case 'CENTRO_LOCAL':
        return { bg: 'rgba(14, 165, 233, 0.15)', color: 'var(--tt-color-primary)', label: nombre || 'En Tránsito / Envío' };
      case 'PREPARANDO':
      case 'ESPERANDO_PROVEEDOR':
      case 'LISTO_ENVIO':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--tt-color-warning)', label: nombre || 'Preparando Pedido' };
      case 'CANCELADO':
      case 'DEVOLUCION_SOLICITADA':
      case 'DEVUELTO':
      case 'REEMBOLSADO':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: 'var(--tt-color-error)', label: nombre || 'Cancelado / Devuelto' };
      case 'CREADO':
      case 'PENDIENTE_PAGO':
      case 'PAGO_AUTORIZADO':
      default:
        return { bg: 'rgba(100, 116, 139, 0.15)', color: 'var(--tt-color-text-muted)', label: nombre || st };
    }
  };

  const style = getBadgeStyle(code);

  return (
    <span
      className="tt-badge"
      style={{
        backgroundColor: style.bg,
        color: style.color,
        fontSize: '0.75rem',
        fontWeight: 700,
        padding: '0.25rem 0.6rem',
        borderRadius: '9999px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.3rem',
      }}
    >
      <span
        style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: style.color,
          display: 'inline-block',
        }}
      />
      {style.label}
    </span>
  );
};
