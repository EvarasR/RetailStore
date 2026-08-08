import React, { useState } from 'react';
import { Award, CheckCircle2, Shield, Calendar, CreditCard, RefreshCw, XCircle } from 'lucide-react';
import type {
  MembershipActive,
  MembershipPlan,
  MembershipPaymentItem,
  PaymentMethodItem,
} from '../../types/membership.types';
import { MembershipBenefits } from './MembershipBenefits';
import { MembershipPaymentForm } from './MembershipPaymentForm';

interface MembershipPanelProps {
  membership: MembershipActive | null;
  planes: MembershipPlan[];
  pagos: MembershipPaymentItem[];
  metodosPago: PaymentMethodItem[];
  onPay: (
    cod_plan: string | number,
    cod_metodo_pago: number,
    renovacion_automatica: boolean
  ) => Promise<unknown>;
  onCancel: () => Promise<unknown>;
  loading: boolean;
}

export const MembershipPanel: React.FC<MembershipPanelProps> = ({
  membership,
  planes,
  pagos,
  metodosPago,
  onPay,
  onCancel,
}) => {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [loadingCancel, setLoadingCancel] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);

  const isPrimeActive = Boolean(membership && membership.activa);
  const planActual = planes.find((p) => String(p.cod_plan) === String(membership?.cod_plan)) || planes[0];
  const beneficiosMostrar = planActual ? planActual.beneficios : planes[0]?.beneficios || [];

  const handleCancelMembership = async () => {
    if (!window.confirm('¿Estás seguro de cancelar tu suscripción corporativa Prime en el servidor? El historial y beneficios vigentes hasta fin de ciclo se conservarán según las reglas del backend.')) {
      return;
    }
    setLoadingCancel(true);
    setCancelError(null);
    try {
      await onCancel();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cancelar la membresía.';
      setCancelError(msg);
    } finally {
      setLoadingCancel(false);
    }
  };

  return (
    <div className="tt-membership-panel">
      {/* Tarjeta corporativa de estado de membresía */}
      <div
        style={{
          backgroundColor: isPrimeActive
            ? 'rgba(14, 165, 233, 0.08)'
            : 'var(--tt-color-surface)',
          border: `2px solid ${isPrimeActive ? 'var(--tt-color-primary)' : 'var(--tt-color-border)'}`,
          borderRadius: '0.75rem',
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '0.75rem',
                backgroundColor: isPrimeActive ? 'var(--tt-color-primary)' : 'rgba(100, 116, 139, 0.15)',
                color: isPrimeActive ? '#ffffff' : 'var(--tt-color-text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Award size={28} />
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--tt-color-primary)', textTransform: 'uppercase' }}>
                  MEMBRESÍA CORPORATIVA
                </span>
                <span
                  className="tt-badge"
                  style={{
                    backgroundColor: isPrimeActive ? 'var(--tt-color-success)' : 'rgba(100, 116, 139, 0.2)',
                    color: '#ffffff',
                    fontSize: '0.7rem',
                    padding: '0.2rem 0.6rem',
                    borderRadius: '9999px',
                    fontWeight: 700,
                  }}
                >
                  {isPrimeActive ? 'ACTIVA (PREMIUM_CUSTOMER)' : 'INACTIVA (CUSTOMER)'}
                </span>
              </div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, margin: '0.3rem 0 0 0', color: 'var(--tt-color-text-main)' }}>
                {isPrimeActive ? membership?.plan || 'TechTail Prime Enterprise' : 'Cuenta Estándar TechTail'}
              </h2>
            </div>
          </div>

          <div>
            {!isPrimeActive ? (
              <button
                type="button"
                onClick={() => setShowPaymentForm(!showPaymentForm)}
                className="tt-btn tt-btn--primary"
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.65rem 1.4rem', fontWeight: 700 }}
              >
                <Award size={18} />
                <span>{showPaymentForm ? 'Ocultar Formulario Prime' : 'Activar Membresía Prime'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelMembership}
                className="tt-btn tt-btn--secondary"
                disabled={loadingCancel}
                style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--tt-color-error)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
              >
                <XCircle size={16} />
                <span>{loadingCancel ? 'Cancelando...' : 'Cancelar Membresía'}</span>
              </button>
            )}
          </div>
        </div>

        {cancelError && (
          <p style={{ color: 'var(--tt-color-error)', fontSize: '0.875rem', margin: 0 }}>
            {cancelError}
          </p>
        )}

        {/* Detalles en cards de la membresía activa */}
        {isPrimeActive && membership && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: '1rem',
              borderTop: '1px solid var(--tt-color-border)',
              paddingTop: '1.25rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Calendar size={18} color="var(--tt-color-text-light)" />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-muted)', display: 'block' }}>Fecha de Inicio</span>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--tt-color-text-main)' }}>
                  {membership.fecha_inicio || 'N/D'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Calendar size={18} color="var(--tt-color-text-light)" />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-muted)', display: 'block' }}>Vencimiento Oficial</span>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--tt-color-text-main)' }}>
                  {membership.fecha_fin || 'N/D'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <RefreshCw size={18} color="var(--tt-color-text-light)" />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-muted)', display: 'block' }}>Renovación</span>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--tt-color-text-main)' }}>
                  {membership.renovacion_automatica ? 'Automática activa' : 'Manual'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Shield size={18} color="var(--tt-color-primary)" />
              <div>
                <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-muted)', display: 'block' }}>Beneficios BD</span>
                <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--tt-color-primary)' }}>
                  {beneficiosMostrar.length} beneficios corporativos
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Formulario de pago simulado */}
      {(showPaymentForm || !isPrimeActive) && (
        <MembershipPaymentForm
          planes={planes}
          metodosPago={metodosPago}
          onPay={onPay}
          onSuccess={() => setShowPaymentForm(false)}
        />
      )}

      {/* Grid de Beneficios Prime devueltos por el servidor */}
      <MembershipBenefits beneficios={beneficiosMostrar} />

      {/* Historial de Pagos de Membresía (PostgreSQL) */}
      {pagos.length > 0 && (
        <div
          style={{
            backgroundColor: 'var(--tt-color-surface)',
            border: '1px solid var(--tt-color-border)',
            borderRadius: '0.75rem',
            padding: '1.5rem',
            marginTop: '2rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
            <CreditCard size={20} color="var(--tt-color-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>
              Historial de Pagos Prime de Membresía
            </h3>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table className="tt-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--tt-color-border)' }}>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.8125rem', color: 'var(--tt-color-text-muted)' }}>CÓDIGO PAGO</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.8125rem', color: 'var(--tt-color-text-muted)' }}>FECHA TRANSACCIÓN</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.8125rem', color: 'var(--tt-color-text-muted)' }}>MONTO OFICIAL</th>
                  <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.8125rem', color: 'var(--tt-color-text-muted)' }}>ESTADO BD</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((p) => (
                  <tr key={p.cod_pago} style={{ borderBottom: '1px solid var(--tt-color-border)' }}>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, fontSize: '0.875rem' }}>#{p.cod_pago}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.875rem', color: 'var(--tt-color-text-light)' }}>{p.fecha}</td>
                    <td style={{ padding: '0.75rem 0.5rem', fontWeight: 700, color: 'var(--tt-color-primary)' }}>{p.monto}</td>
                    <td style={{ padding: '0.75rem 0.5rem' }}>
                      <span className="tt-badge" style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)', color: 'var(--tt-color-success)', fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: '9999px', fontWeight: 700 }}>
                        <CheckCircle2 size={13} style={{ display: 'inline', marginRight: '4px' }} />
                        Registrado ACID
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
