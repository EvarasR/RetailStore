import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Package, Clock, ShieldAlert } from 'lucide-react';
import type { CartItem as CartItemType } from '../../types/cart.types';

interface CartItemProps {
  item: CartItemType;
  onUpdateQuantity: (cod_producto: number, newQty: number) => void;
  onRemove: (cod_producto: number) => void;
  updating?: boolean;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  updating = false,
}) => {
  const cot = item.cotizacion;

  return (
    <div
      className="tt-card"
      style={{
        padding: '1.25rem',
        display: 'grid',
        gridTemplateColumns: '90px 1fr auto auto',
        gap: '1.25rem',
        alignItems: 'center',
        opacity: updating ? 0.6 : 1,
        transition: 'opacity 0.2s ease',
      }}
    >
      {/* Imagen */}
      <Link to={`/catalogo/${item.cod_producto}`} style={{ display: 'block' }}>
        <img
          src={item.imagen}
          alt={item.nombre}
          style={{
            width: '90px',
            height: '90px',
            objectFit: 'contain',
            borderRadius: '0.5rem',
            backgroundColor: 'var(--tt-color-surface)',
            padding: '0.5rem',
          }}
        />
      </Link>

      {/* Información principal */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>
          {item.marca}
        </span>
        <Link
          to={`/catalogo/${item.cod_producto}`}
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--tt-color-text)',
            textDecoration: 'none',
            lineHeight: '1.4',
          }}
        >
          {item.nombre}
        </Link>

        {/* Precio unitario */}
        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Precio unitario: <strong>${item.precio_unitario}</strong>
        </div>

        {/* Badges de cotización oficial DB-First */}
        {cot && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: '0.5rem' }}>
            {cot.requiere_proveedor && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#f59e0b', fontWeight: 600 }}>
                <Package size={14} /> Despacho de proveedor especializado
              </span>
            )}
            {typeof cot.tiempo_estimado_dias === 'number' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                <Clock size={14} /> Tiempo estimado de entrega: {cot.tiempo_estimado_dias} días
              </span>
            )}
            {cot.cantidad_faltante > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.75rem', color: '#ef4444', fontWeight: 600 }}>
                <ShieldAlert size={14} /> Stock en almacén: {cot.cantidad_cubierta} u. (Faltan {cot.cantidad_faltante} en backorder)
              </span>
            )}
            {cot.mensajes && cot.mensajes.length > 0 && (
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                {cot.mensajes.map((m, idx) => (
                  <div key={idx}>• {m}</div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Controles de cantidad */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.cod_producto, Math.max(1, item.cantidad - 1))}
          disabled={updating || item.cantidad <= 1}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '0.375rem',
            border: '1px solid var(--tt-color-border)',
            backgroundColor: 'var(--tt-color-surface)',
            color: 'var(--tt-color-text)',
            cursor: item.cantidad > 1 ? 'pointer' : 'not-allowed',
            fontWeight: 700,
          }}
          aria-label="Disminuir cantidad"
        >
          -
        </button>
        <span style={{ minWidth: '24px', textAlign: 'center', fontWeight: 700, fontSize: '0.9375rem' }}>
          {item.cantidad}
        </span>
        <button
          type="button"
          onClick={() => onUpdateQuantity(item.cod_producto, item.cantidad + 1)}
          disabled={updating}
          style={{
            width: '32px',
            height: '32px',
            borderRadius: '0.375rem',
            border: '1px solid var(--tt-color-border)',
            backgroundColor: 'var(--tt-color-surface)',
            color: 'var(--tt-color-text)',
            cursor: 'pointer',
            fontWeight: 700,
          }}
          aria-label="Aumentar cantidad"
        >
          +
        </button>
      </div>

      {/* Subtotal y Eliminar */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
        <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--tt-color-text)' }}>
          ${item.subtotal}
        </div>
        <button
          type="button"
          onClick={() => onRemove(item.cod_producto)}
          disabled={updating}
          style={{
            background: 'none',
            border: 'none',
            color: '#ef4444',
            cursor: 'pointer',
            padding: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
          title="Eliminar producto"
        >
          <Trash2 size={16} /> Eliminar
        </button>
      </div>
    </div>
  );
};
