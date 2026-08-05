import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight, FileText, ShoppingBag } from 'lucide-react';
import type { CreateOrderResult } from '../../types/checkout.types';
import type { Address } from '../../types/address.types';
import type { PaymentMethod } from '../../types/payment.types';

interface CheckoutConfirmationProps {
  order: CreateOrderResult | null;
  captureResult: unknown | null;
  address: Address | undefined;
  paymentMethod: PaymentMethod | undefined;
}

export const CheckoutConfirmation: React.FC<CheckoutConfirmationProps> = ({
  order,
  captureResult,
  address,
  paymentMethod,
}) => {
  const cap = captureResult as {
    ok?: boolean;
    mensaje?: string;
    cod_pedido?: number;
    numero_pedido?: string;
    numero_factura?: string;
    factura?: {
      numero_factura: string;
      subtotal: string;
      descuento: string;
      impuesto: string;
      costo_envio: string;
      total: string;
    };
  } | null;

  const orderNum = cap?.numero_pedido || order?.cod_pedido || 'TT-ORDER';
  const facturaNum = cap?.factura?.numero_factura || cap?.numero_factura;

  return (
    <div
      className="tt-card"
      style={{
        padding: '3rem 2rem',
        textAlign: 'center',
        maxWidth: '720px',
        margin: '1rem auto',
      }}
    >
      <div
        style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.5rem',
        }}
      >
        <CheckCircle2 size={44} color="#10b981" />
      </div>

      <span
        style={{
          fontSize: '0.75rem',
          fontWeight: 800,
          backgroundColor: '#10b981',
          color: '#ffffff',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          letterSpacing: '1px',
        }}
      >
        PEDIDO CONFIRMADO Y CAPTURADO EN POSTGRESQL
      </span>

      <h2 style={{ fontSize: '1.75rem', fontWeight: 800, margin: '1rem 0 0.5rem' }}>
        ¡Gracias por tu pedido, TechTail!
      </h2>

      <p style={{ fontSize: '1rem', color: '#64748b', marginBottom: '2rem', lineHeight: '1.6' }}>
        El pedido <strong>#{orderNum}</strong> ha sido registrado formalmente en nuestro motor de órdenes y el pago simulado fue capturado con éxito.
      </p>

      {/* Tarjetas informativas del pedido */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          textAlign: 'left',
          marginBottom: '2rem',
        }}
      >
        <div className="tt-card" style={{ padding: '1rem', backgroundColor: 'var(--tt-color-surface)' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>
            NÚMERO DE PEDIDO
          </div>
          <div style={{ fontSize: '1.125rem', fontWeight: 800 }}>#{orderNum}</div>
          {facturaNum && (
            <div style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
              <FileText size={14} /> Factura: {facturaNum}
            </div>
          )}
        </div>

        {address && (
          <div className="tt-card" style={{ padding: '1rem', backgroundColor: 'var(--tt-color-surface)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>
              ENTREGA EN
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{address.receptor}</div>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
              {address.ciudad}, {address.provincia}
            </div>
          </div>
        )}

        {paymentMethod && (
          <div className="tt-card" style={{ padding: '1rem', backgroundColor: 'var(--tt-color-surface)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.25rem' }}>
              MÉTODO DE PAGO
            </div>
            <div style={{ fontSize: '0.9375rem', fontWeight: 700 }}>
              {paymentMethod.marca || paymentMethod.tipo} *{paymentMethod.ultimos4}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10b981' }}>Autorizado en pasarela</div>
          </div>
        )}
      </div>

      {cap?.factura && (
        <div
          className="tt-card"
          style={{
            padding: '1.25rem',
            textAlign: 'left',
            marginBottom: '2.5rem',
            backgroundColor: 'rgba(59, 130, 246, 0.03)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
          }}
        >
          <div style={{ fontSize: '0.875rem', fontWeight: 800, marginBottom: '0.75rem' }}>
            Resumen de Factura Electrónica DB-First
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.375rem' }}>
            <span>Subtotal:</span>
            <span>${cap.factura.subtotal}</span>
          </div>
          {Number(cap.factura.descuento) > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: '#10b981', marginBottom: '0.375rem' }}>
              <span>Descuento:</span>
              <span>-${cap.factura.descuento}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.375rem' }}>
            <span>Impuesto:</span>
            <span>${cap.factura.impuesto}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', marginBottom: '0.375rem' }}>
            <span>Envío:</span>
            <span>${cap.factura.costo_envio}</span>
          </div>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '1.125rem',
              fontWeight: 800,
              marginTop: '0.5rem',
              paddingTop: '0.5rem',
              borderTop: '1px solid var(--tt-color-border)',
            }}
          >
            <span>Total Facturado:</span>
            <span>${cap.factura.total}</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link
          to="/catalogo"
          style={{
            backgroundColor: 'var(--tt-color-primary)',
            color: '#ffffff',
            padding: '0.875rem 1.75rem',
            borderRadius: '0.5rem',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <ShoppingBag size={18} /> Seguir Comprando
        </Link>
        <Link
          to="/perfil"
          style={{
            backgroundColor: 'var(--tt-color-surface)',
            color: 'var(--tt-color-text)',
            border: '1px solid var(--tt-color-border)',
            padding: '0.875rem 1.75rem',
            borderRadius: '0.5rem',
            fontWeight: 700,
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          Ver Mis Pedidos <ArrowRight size={18} />
        </Link>
      </div>
    </div>
  );
};
