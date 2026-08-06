import React from 'react';
import { ShieldCheck, Lock } from 'lucide-react';
import { CheckoutStepper } from './CheckoutStepper';

interface CheckoutLayoutProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  children: React.ReactNode;
  summary?: React.ReactNode;
}

export const CheckoutLayout: React.FC<CheckoutLayoutProps> = ({
  currentStep,
  onStepClick,
  children,
  summary,
}) => {
  const isConfirmation = currentStep === 6;

  return (
    <div className="tt-container" style={{ padding: '2rem 1.5rem', maxWidth: '1280px' }}>
      <div className="tt-page-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
          <span className="tt-badge tt-badge--primary">CHECKOUT DB-FIRST • MOTOR ACID</span>
          <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', fontWeight: 600 }}>
            <Lock size={12} /> Cifrado y validado en backend
          </span>
        </div>
        <h1 className="tt-page-header__title">Finalización de Compra TechTail</h1>
        <p className="tt-page-header__subtitle">
          Proceso corporativo guiado en 6 pasos. La disponibilidad, cotizaciones e impuestos se gestionan en PostgreSQL.
        </p>
      </div>

      <CheckoutStepper currentStep={currentStep} onStepClick={onStepClick} />

      {isConfirmation ? (
        <div style={{ width: '100%' }}>{children}</div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
            alignItems: 'start',
          }}
        >
          {/* Contenido principal del paso */}
          <div style={{ flex: 2, minWidth: '0' }}>{children}</div>

          {/* Resumen lateral permanente */}
          {summary && (
            <div style={{ flex: 1, minWidth: '320px', maxWidth: '420px' }}>
              {summary}
            </div>
          )}
        </div>
      )}

      <div
        style={{
          marginTop: '3rem',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--tt-color-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.8125rem',
          color: '#64748b',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <ShieldCheck size={18} color="#10b981" />
          <span>TechTail Marketplace — Integración Transaccional DB-First con Django 5 y PostgreSQL</span>
        </div>
        <div>Soporte B2B y Consultas de Despacho: soporte@techtail.com</div>
      </div>
    </div>
  );
};
