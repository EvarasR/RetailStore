import React from 'react';
import { ShoppingBag, ShieldCheck, Lock } from 'lucide-react';
import type { CartData } from '../../types/cart.types';
import type { ShippingMethod } from '../../types/checkout.types';

interface CheckoutSummaryProps {
  cart: CartData | null;
  selectedShippingMethod?: ShippingMethod | undefined;
}

export const CheckoutSummary: React.FC<CheckoutSummaryProps> = ({
  cart,
  selectedShippingMethod,
}) => {
  if (!cart) return null;

  const desglose = cart.desglose;

  return (
    <div className="tt-card" style={{ padding: '1.5rem', position: 'sticky', top: '2rem' }}>
      <h3
        style={{
          fontSize: '1.125rem',
          fontWeight: 800,
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <ShoppingBag size={20} color="var(--tt-color-primary)" /> Resumen Corporativo
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--tt-color-text-muted)' }}>
          <span>Subtotal ({cart.cantidad_items} ítems):</span>
          <span style={{ fontWeight: 600, color: 'var(--tt-color-text-main)' }}>
            ${desglose?.subtotal_carrito || cart.total}
          </span>
        </div>

        {desglose?.descuento && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--tt-color-success)' }}>
            <span>Descuento aplicado:</span>
            <span style={{ fontWeight: 600 }}>-${desglose.descuento}</span>
          </div>
        )}

        {selectedShippingMethod && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--tt-color-text-muted)' }}>
            <span>Envío estimado ({selectedShippingMethod.nombre}):</span>
            <span style={{ fontWeight: 600, color: 'var(--tt-color-text-main)' }}>
              ${selectedShippingMethod.costo_base}
            </span>
          </div>
        )}

        <div
          style={{
            height: '1px',
            backgroundColor: 'var(--tt-color-border)',
            margin: '0.25rem 0',
          }}
        />

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
            fontSize: '1.125rem',
            fontWeight: 800,
            color: 'var(--tt-color-text-main)',
          }}
        >
          <span>Total del Carrito:</span>
          <span>${cart.total}</span>
        </div>

        <p style={{ fontSize: '0.7rem', color: 'var(--tt-color-text-muted)', fontStyle: 'italic', lineHeight: '1.4', marginTop: '0.25rem' }}>
          * El cálculo tributario e importes finales de despacho se asientan formalmente al autorizar el pedido en PostgreSQL.
        </p>
      </div>

      <div
        style={{
          padding: '0.75rem',
          borderRadius: '0.5rem',
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          border: '1px solid rgba(59, 130, 246, 0.15)',
          fontSize: '0.75rem',
          color: 'var(--tt-color-text-muted)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <Lock size={16} color="var(--tt-color-primary)" style={{ flexShrink: 0 }} />
        <span>Conexión cifrada con validación en servidor Django 5</span>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '1rem',
          fontSize: '0.7rem',
          color: 'var(--tt-color-text-muted)',
        }}
      >
        <ShieldCheck size={14} color="var(--tt-color-success)" />
        <span>Garantía Prime / Soporte corporativo B2B TechTail</span>
      </div>
    </div>
  );
};
