import React from 'react';
import { ShieldCheck, CheckCircle2, Lock, AlertTriangle, Truck, MapPin, CreditCard } from 'lucide-react';
import type { CartData } from '../../types/cart.types';
import type { Address } from '../../types/address.types';
import type { ShippingMethod } from '../../types/checkout.types';
import type { PaymentMethod } from '../../types/payment.types';

interface CheckoutReviewProps {
  cart: CartData;
  address: Address | undefined;
  shippingMethod: ShippingMethod | undefined;
  paymentMethod: PaymentMethod | undefined;
  onConfirmOrder: () => Promise<void>;
  processing?: boolean;
}

export const CheckoutReview: React.FC<CheckoutReviewProps> = ({
  cart,
  address,
  shippingMethod,
  paymentMethod,
  onConfirmOrder,
  processing = false,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={20} color="var(--tt-color-primary)" /> Revisión Final del Pedido TechTail
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Verifica tus productos, dirección y método antes de crear la orden formal en PostgreSQL.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* Card Dirección */}
        <div
          className="tt-card"
          style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <MapPin size={14} /> DIRECCIÓN DE ENTREGA
          </div>
          {address ? (
            <>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{address.receptor}</div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{address.linea1}</div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                {address.ciudad}, {address.provincia}
              </div>
            </>
          ) : (
            <div style={{ fontSize: '0.8125rem', color: '#ef4444' }}>Falta seleccionar dirección</div>
          )}
        </div>

        {/* Card Envío */}
        <div
          className="tt-card"
          style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <Truck size={14} /> MÉTODO DE ENVÍO
          </div>
          {shippingMethod ? (
            <>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>{shippingMethod.nombre}</div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                Entrega estimada: {shippingMethod.dias_min}-{shippingMethod.dias_max} días
              </div>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--tt-color-primary)' }}>
                Tarifa DB: ${shippingMethod.costo_base}
              </div>
            </>
          ) : (
            <div style={{ fontSize: '0.8125rem', color: '#ef4444' }}>Falta seleccionar método de envío</div>
          )}
        </div>

        {/* Card Pago */}
        <div
          className="tt-card"
          style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.375rem' }}
        >
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <CreditCard size={14} /> PAGO CORPORATIVO
          </div>
          {paymentMethod ? (
            <>
              <div style={{ fontWeight: 700, fontSize: '0.9375rem' }}>
                {paymentMethod.marca || paymentMethod.tipo} •••• {paymentMethod.ultimos4}
              </div>
              <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>Titular: {paymentMethod.titular}</div>
              <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600 }}>
                Idempotency garantizada DB-First
              </div>
            </>
          ) : (
            <div style={{ fontSize: '0.8125rem', color: '#ef4444' }}>Falta seleccionar tarjeta</div>
          )}
        </div>
      </div>

      {/* Tabla de ítems y cotización */}
      <div className="tt-card" style={{ padding: '1.25rem' }}>
        <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, marginBottom: '1rem' }}>
          Productos incluidos en tu orden ({cart.cantidad_items})
        </h4>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {cart.items.map((item) => (
            <div
              key={item.cod_producto}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingBottom: '0.75rem',
                borderBottom: '1px solid var(--tt-color-border)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <img
                  src={item.imagen}
                  alt={item.nombre}
                  style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '0.375rem' }}
                />
                <div>
                  <div style={{ fontSize: '0.9375rem', fontWeight: 700 }}>{item.nombre}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                    Cant: {item.cantidad} x ${item.precio_unitario}
                  </div>
                </div>
              </div>

              <div style={{ fontWeight: 800, fontSize: '1rem' }}>${item.subtotal}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Alerta de backorder si existe */}
      {cart.items.some((item) => item.cotizacion && item.cotizacion.cantidad_faltante > 0) && (
        <div
          style={{
            padding: '1rem',
            borderRadius: '0.75rem',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            gap: '0.75rem',
            alignItems: 'flex-start',
          }}
        >
          <AlertTriangle size={20} color="#f59e0b" style={{ flexShrink: 0 }} />
          <div style={{ fontSize: '0.875rem', color: '#f59e0b' }}>
            <strong>Nota importante de inventario:</strong> Algunos productos de tu carrito reportan backorder o despacho especial por proveedor. El pedido se creará formalmente en PostgreSQL respetando esta cotización.
          </div>
        </div>
      )}

      {/* Botón final de confirmar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', alignItems: 'flex-end', marginTop: '1rem' }}>
        <button
          type="button"
          onClick={onConfirmOrder}
          disabled={processing || !address || !shippingMethod || !paymentMethod}
          style={{
            backgroundColor: 'var(--tt-color-primary)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.75rem',
            padding: '1.125rem 2.5rem',
            fontSize: '1.0625rem',
            fontWeight: 800,
            cursor: processing || !address || !shippingMethod || !paymentMethod ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            boxShadow: '0 6px 16px rgba(59, 130, 246, 0.25)',
            transition: 'all 0.2s ease',
          }}
        >
          <Lock size={20} />
          {processing ? 'Autorizando con pasarela y creando pedido en BD...' : 'Confirmar y Autorizar Pedido en PostgreSQL'}
        </button>

        <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
          <ShieldCheck size={16} color="#10b981" />
          <span>Al confirmar, el pedido y la transacción quedan registrados mediante procedimientos transaccionales ACID.</span>
        </div>
      </div>
    </div>
  );
};
