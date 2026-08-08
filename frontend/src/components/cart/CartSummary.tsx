import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, ShoppingBag } from 'lucide-react';
import type { CartData } from '../../types/cart.types';

interface CartSummaryProps {
  cart: CartData;
  onValidateAndCheckout: () => Promise<void>;
  validating?: boolean;
}

export const CartSummary: React.FC<CartSummaryProps> = ({
  cart,
  onValidateAndCheckout,
  validating = false,
}) => {
  const desglose = cart.desglose;

  return (
    <div className="tt-card" style={{ padding: '1.75rem', position: 'sticky', top: '2rem' }}>
      <h3
        style={{
          fontSize: '1.25rem',
          fontWeight: 800,
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <ShoppingBag size={22} color="var(--tt-color-primary)" /> Resumen del Carrito
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem', marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem', color: 'var(--tt-color-text-muted)' }}>
          <span>Subtotal ({cart.cantidad_items} ítems):</span>
          <span style={{ fontWeight: 600, color: 'var(--tt-color-text-main)' }}>
            ${desglose?.subtotal_carrito || cart.total}
          </span>
        </div>

        {desglose?.descuento && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem', color: 'var(--tt-color-success)' }}>
            <span>Descuento aplicado:</span>
            <span style={{ fontWeight: 600 }}>-${desglose.descuento}</span>
          </div>
        )}

        {desglose?.impuesto && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem', color: 'var(--tt-color-text-muted)' }}>
            <span>Impuesto estimado:</span>
            <span style={{ fontWeight: 600, color: 'var(--tt-color-text-main)' }}>${desglose.impuesto}</span>
          </div>
        )}

        {desglose?.costo_envio && (
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9375rem', color: 'var(--tt-color-text-muted)' }}>
            <span>Envío estimado:</span>
            <span style={{ fontWeight: 600, color: 'var(--tt-color-text-main)' }}>${desglose.costo_envio}</span>
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
            fontSize: '1.25rem',
            fontWeight: 800,
            color: 'var(--tt-color-text-main)',
          }}
        >
          <span>Total:</span>
          <span>${cart.total}</span>
        </div>

        {desglose?.mensaje && (
          <p style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-muted)', fontStyle: 'italic', lineHeight: '1.4', marginTop: '0.25rem' }}>
            * {desglose.mensaje}
          </p>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <button
          type="button"
          onClick={onValidateAndCheckout}
          disabled={validating || cart.cantidad_items === 0}
          style={{
            backgroundColor: 'var(--tt-color-primary)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.5rem',
            padding: '1rem',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: validating || cart.cantidad_items === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 12px rgba(15, 23, 42, 0.15)',
            transition: 'background-color 0.2s ease',
          }}
        >
          {validating ? 'Validando con PostgreSQL...' : 'Continuar al Checkout'}
          {!validating && <ArrowRight size={18} />}
        </button>

        <Link
          to="/catalogo"
          style={{
            textAlign: 'center',
            padding: '0.875rem',
            borderRadius: '0.5rem',
            border: '1px solid var(--tt-color-border)',
            backgroundColor: 'var(--tt-color-surface)',
            color: 'var(--tt-color-text-main)',
            fontWeight: 600,
            textDecoration: 'none',
            fontSize: '0.9375rem',
          }}
        >
          Seguir comprando
        </Link>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginTop: '1.25rem',
          fontSize: '0.75rem',
          color: 'var(--tt-color-text-muted)',
        }}
      >
        <ShieldCheck size={16} color="var(--tt-color-success)" />
        <span>Garantía de cotización DB-First supervisada por el motor transaccional TechTail</span>
      </div>
    </div>
  );
};
