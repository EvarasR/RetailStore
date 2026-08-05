import React from 'react';
import { CreditCard, Plus, CheckCircle2, ShieldCheck } from 'lucide-react';
import type { PaymentMethod } from '../../types/payment.types';

interface PaymentMethodSelectorProps {
  methods: PaymentMethod[];
  selectedMethodId: number | null;
  onSelectMethod: (id: number) => void;
  onOpenCardForm: () => void;
  loading?: boolean;
}

export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  methods,
  selectedMethodId,
  onSelectMethod,
  onOpenCardForm,
  loading = false,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={20} color="var(--tt-color-primary)" /> Método de Pago Corporativo (Simulado)
          </h3>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
            Pasarela de pago simulada corporativa conectada a /operaciones/api/.
          </p>
        </div>
        <button
          type="button"
          onClick={onOpenCardForm}
          disabled={loading}
          style={{
            backgroundColor: 'var(--tt-color-surface)',
            color: 'var(--tt-color-text)',
            border: '1px solid var(--tt-color-primary)',
            padding: '0.625rem 1rem',
            borderRadius: '0.5rem',
            fontWeight: 700,
            fontSize: '0.875rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
          }}
        >
          <Plus size={16} /> Agregar Tarjeta Simulada
        </button>
      </div>

      {methods.length === 0 ? (
        <div
          className="tt-card"
          style={{
            padding: '2rem',
            textAlign: 'center',
            borderStyle: 'dashed',
            backgroundColor: 'rgba(59, 130, 246, 0.03)',
          }}
        >
          <CreditCard size={36} color="#94a3b8" style={{ margin: '0 auto 0.75rem' }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.375rem' }}>
            No tienes tarjetas corporativas asociadas
          </h4>
          <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
            Registra una tarjeta simulada para autorizar y capturar el pedido en PostgreSQL.
          </p>
          <button
            type="button"
            onClick={onOpenCardForm}
            style={{
              backgroundColor: 'var(--tt-color-primary)',
              color: '#ffffff',
              border: 'none',
              padding: '0.75rem 1.25rem',
              borderRadius: '0.5rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            + Registrar Tarjeta Simulada
          </button>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {methods.map((method) => {
            const isSelected = selectedMethodId === method.cod_metodo_pago;
            return (
              <div
                key={method.cod_metodo_pago}
                onClick={() => onSelectMethod(method.cod_metodo_pago)}
                style={{
                  padding: '1.25rem',
                  borderRadius: '0.75rem',
                  border: isSelected
                    ? '2px solid var(--tt-color-primary)'
                    : '1px solid var(--tt-color-border)',
                  backgroundColor: isSelected
                    ? 'rgba(59, 130, 246, 0.05)'
                    : 'var(--tt-color-surface)',
                  cursor: 'pointer',
                  position: 'relative',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      padding: '0.125rem 0.5rem',
                      borderRadius: '0.25rem',
                      textTransform: 'uppercase',
                    }}
                  >
                    {method.marca || method.tipo}
                  </span>

                  {isSelected && <CheckCircle2 size={20} color="var(--tt-color-primary)" />}
                </div>

                <div style={{ fontSize: '1.125rem', fontWeight: 800, letterSpacing: '1px', marginBottom: '0.5rem' }}>
                  •••• •••• •••• {method.ultimos4}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
                  <span>TITULAR: {method.titular}</span>
                  <span>
                    EXP: {String(method.exp_mes).padStart(2, '0')}/{method.exp_anio}
                  </span>
                </div>

                {method.saldo_disponible && (
                  <div style={{ fontSize: '0.75rem', color: '#10b981', fontWeight: 600, marginTop: '0.5rem' }}>
                    Saldo de prueba: ${method.saldo_disponible}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.75rem',
          color: '#64748b',
          marginTop: '0.5rem',
        }}
      >
        <ShieldCheck size={16} color="#10b981" />
        <span>Pago protegido por pasarela simulada con idempotency key. No procesa transacciones bancarias reales.</span>
      </div>
    </div>
  );
};
