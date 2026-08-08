import React, { useState } from 'react';
import { CreditCard, Zap, CheckCircle2, AlertCircle } from 'lucide-react';
import type { MembershipPlan, PaymentMethodItem } from '../../types/membership.types';

interface MembershipPaymentFormProps {
  planes: MembershipPlan[];
  metodosPago: PaymentMethodItem[];
  onPay: (
    cod_plan: string | number,
    cod_metodo_pago: number,
    renovacion_automatica: boolean
  ) => Promise<unknown>;
  onSuccess?: () => void;
}

export const MembershipPaymentForm: React.FC<MembershipPaymentFormProps> = ({
  planes,
  metodosPago,
  onPay,
  onSuccess,
}) => {
  const [selectedPlan, setSelectedPlan] = useState<string | number>(
    planes[0]?.cod_plan || ''
  );
  const [selectedMetodo, setSelectedMetodo] = useState<number>(
    metodosPago[0]?.cod_metodo_pago || 0
  );
  const [renovacion, setRenovacion] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !selectedMetodo) {
      setError('Por favor selecciona un plan y un método de pago válido.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      await onPay(selectedPlan, selectedMetodo, renovacion);
      setSuccessMsg('Membresía Prime pagada y activada corporativamente en BD.');
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al procesar pago simulado en el servidor.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (planes.length === 0) {
    return (
      <div style={{ padding: '1.5rem', backgroundColor: 'var(--tt-color-surface)', borderRadius: '0.75rem', border: '1px solid var(--tt-color-border)' }}>
        <p style={{ color: 'var(--tt-color-text-muted)', margin: 0, fontSize: '0.875rem' }}>
          No hay planes de membresía disponibles en este momento.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="tt-membership-form"
      style={{
        backgroundColor: 'var(--tt-color-surface)',
        border: '1px solid var(--tt-color-border)',
        borderRadius: '0.75rem',
        padding: '1.75rem',
        marginTop: '1.5rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <Zap size={22} color="var(--tt-color-primary)" />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>
          Pago Simulado de Membresía Prime (PostgreSQL)
        </h3>
      </div>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--tt-color-error)',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            color: 'var(--tt-color-success)',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
          }}
        >
          <CheckCircle2 size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      <div style={{ marginBottom: '1.25rem' }}>
        <label htmlFor="select-plan" className="tt-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
          Selecciona tu Plan Corporativo *
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
          {planes.map((p) => {
            const isSelected = String(selectedPlan) === String(p.cod_plan);
            return (
              <div
                key={p.cod_plan}
                onClick={() => setSelectedPlan(p.cod_plan)}
                style={{
                  border: `2px solid ${isSelected ? 'var(--tt-color-primary)' : 'var(--tt-color-border)'}`,
                  borderRadius: '0.75rem',
                  padding: '1rem',
                  cursor: 'pointer',
                  backgroundColor: isSelected ? 'rgba(14, 165, 233, 0.06)' : 'var(--tt-color-surface)',
                  transition: 'all 0.2s ease',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.3rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--tt-color-text-main)' }}>
                    {p.nombre}
                  </span>
                  {isSelected && <CheckCircle2 size={18} color="var(--tt-color-primary)" />}
                </div>
                <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--tt-color-primary)' }}>
                  {p.precio_mensual}
                  <span style={{ fontSize: '0.75rem', fontWeight: 400, color: 'var(--tt-color-text-muted)' }}>
                    {' '}/ {p.duracion_dias} días
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ marginBottom: '1.25rem' }}>
        <label htmlFor="select-metodo-pago" className="tt-label" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.875rem' }}>
          Método de Pago Corporativo Simulado *
        </label>
        {metodosPago.length > 0 ? (
          <select
            id="select-metodo-pago"
            className="tt-select"
            style={{ width: '100%' }}
            value={selectedMetodo}
            onChange={(e) => setSelectedMetodo(Number(e.target.value))}
            disabled={loading}
          >
            {metodosPago.map((m) => (
              <option key={m.cod_metodo_pago} value={m.cod_metodo_pago}>
                {m.marca} terminada en {m.ultimos4} — Titular: {m.titular} {m.saldo_disponible ? `(Saldo BD: ${m.saldo_disponible})` : ''}
              </option>
            ))}
          </select>
        ) : (
          <div style={{ padding: '0.85rem 1rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--tt-color-warning)', borderRadius: '0.5rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={18} />
            <span>
              No tienes tarjetas corporativas guardadas. Agrega tu primer método simulado en el proceso de Checkout o en la plataforma.
            </span>
          </div>
        )}
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--tt-color-text-main)' }}>
          <input
            type="checkbox"
            checked={renovacion}
            onChange={(e) => setRenovacion(e.target.checked)}
            disabled={loading}
            style={{ width: '18px', height: '18px' }}
          />
          <span>Mantener renovación automática en el servidor de suscripciones</span>
        </label>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="submit"
          className="tt-btn tt-btn--primary"
          disabled={loading || metodosPago.length === 0}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.4rem', fontWeight: 700 }}
        >
          <Zap size={17} />
          <span>{loading ? 'Procesando en BD...' : 'Activar Membresía Prime TechTail'}</span>
        </button>
      </div>
    </form>
  );
};
