import React, { useState } from 'react';
import { CreditCard, X, ShieldAlert, Check } from 'lucide-react';

interface PaymentCardFormProps {
  onRegisterMethod: (data: {
    numero_tarjeta: string;
    titular: string;
    exp_mes: string | number;
    exp_anio: string | number;
    cvv: string;
  }) => Promise<{ ok: boolean; mensaje: string }>;
  onClose: () => void;
}

export const PaymentCardForm: React.FC<PaymentCardFormProps> = ({
  onRegisterMethod,
  onClose,
}) => {
  const [numeroTarjeta, setNumeroTarjeta] = useState('4000123456789010');
  const [titular, setTitular] = useState('Cliente TechTail');
  const [expMes, setExpMes] = useState('12');
  const [expAnio, setExpAnio] = useState('2028');
  const [cvv, setCvv] = useState('123');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCard = numeroTarjeta.replace(/\D/g, '');
    if (cleanCard.length < 12 || cleanCard.length > 19) {
      setError('El número de tarjeta debe tener entre 12 y 19 dígitos.');
      return;
    }
    if (!cvv.trim() || (cvv.length !== 3 && cvv.length !== 4)) {
      setError('El código CVV debe tener 3 o 4 dígitos.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      const res = await onRegisterMethod({
        numero_tarjeta: cleanCard,
        titular: titular.trim() || 'Titular TechTail',
        exp_mes: Number(expMes),
        exp_anio: Number(expAnio),
        cvv: cvv.trim(),
      });
      if (!res.ok) {
        throw new Error(res.mensaje || 'Error al registrar la tarjeta.');
      }
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo registrar la tarjeta simulada';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
        padding: '1rem',
      }}
    >
      <div
        className="tt-card"
        style={{
          width: '100%',
          maxWidth: '480px',
          padding: '1.75rem',
          position: 'relative',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CreditCard size={20} color="var(--tt-color-primary)" /> Registrar Tarjeta Simulada
          </h3>
          <button
            type="button"
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
          >
            <X size={20} />
          </button>
        </div>

        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            color: '#f59e0b',
            fontSize: '0.75rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '1.25rem',
          }}
        >
          <ShieldAlert size={18} />
          <span>ENTORNO DE PRUEBA SIMULADA: Usa números de prueba (Ej: 4000... o 5000...). No ingreses tus datos bancarios reales.</span>
        </div>

        {error && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderRadius: '0.5rem',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              color: '#ef4444',
              fontSize: '0.875rem',
              marginBottom: '1rem',
            }}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.375rem' }}>
              Titular de la Tarjeta
            </label>
            <input
              type="text"
              required
              value={titular}
              onChange={(e) => setTitular(e.target.value)}
              placeholder="Juan Pérez"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--tt-color-border)',
                backgroundColor: 'var(--tt-color-surface)',
                color: 'var(--tt-color-text)',
                fontSize: '0.875rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.375rem' }}>
              Número de Tarjeta (16 dígitos de prueba)
            </label>
            <input
              type="text"
              required
              maxLength={19}
              value={numeroTarjeta}
              onChange={(e) => setNumeroTarjeta(e.target.value)}
              placeholder="4000 1234 5678 9010"
              style={{
                width: '100%',
                padding: '0.625rem 0.875rem',
                borderRadius: '0.5rem',
                border: '1px solid var(--tt-color-border)',
                backgroundColor: 'var(--tt-color-surface)',
                color: 'var(--tt-color-text)',
                fontSize: '0.9375rem',
                letterSpacing: '1px',
                fontFamily: 'monospace',
              }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.375rem' }}>
                Mes (MM)
              </label>
              <select
                value={expMes}
                onChange={(e) => setExpMes(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--tt-color-border)',
                  backgroundColor: 'var(--tt-color-surface)',
                  color: 'var(--tt-color-text)',
                  fontSize: '0.875rem',
                }}
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={String(m).padStart(2, '0')}>
                    {String(m).padStart(2, '0')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.375rem' }}>
                Año (YYYY)
              </label>
              <select
                value={expAnio}
                onChange={(e) => setExpAnio(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--tt-color-border)',
                  backgroundColor: 'var(--tt-color-surface)',
                  color: 'var(--tt-color-text)',
                  fontSize: '0.875rem',
                }}
              >
                {Array.from({ length: 10 }, (_, i) => 2026 + i).map((yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 700, marginBottom: '0.375rem' }}>
                CVV
              </label>
              <input
                type="password"
                required
                maxLength={4}
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                placeholder="123"
                style={{
                  width: '100%',
                  padding: '0.625rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--tt-color-border)',
                  backgroundColor: 'var(--tt-color-surface)',
                  color: 'var(--tt-color-text)',
                  fontSize: '0.9375rem',
                  textAlign: 'center',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                backgroundColor: 'var(--tt-color-surface)',
                color: 'var(--tt-color-text)',
                border: '1px solid var(--tt-color-border)',
                padding: '0.75rem 1.25rem',
                borderRadius: '0.5rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                backgroundColor: 'var(--tt-color-primary)',
                color: '#ffffff',
                border: 'none',
                padding: '0.75rem 1.5rem',
                borderRadius: '0.5rem',
                fontWeight: 700,
                cursor: submitting ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              {submitting ? 'Registrando...' : 'Registrar Tarjeta Simulada'}
              {!submitting && <Check size={16} />}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
