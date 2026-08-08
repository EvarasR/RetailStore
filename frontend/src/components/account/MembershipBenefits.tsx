import React from 'react';
import { Award, Zap, Truck, Shield, DollarSign, Gift } from 'lucide-react';
import type { MembershipBenefit } from '../../types/membership.types';

interface MembershipBenefitsProps {
  beneficios: MembershipBenefit[];
}

export const MembershipBenefits: React.FC<MembershipBenefitsProps> = ({ beneficios }) => {
  const getIconForBenefit = (code: string) => {
    const c = code ? code.toUpperCase() : '';
    if (c.includes('ENVIO') || c.includes('FREE')) return <Truck size={22} color="var(--tt-color-primary)" />;
    if (c.includes('DESCUENTO') || c.includes('PRICE')) return <DollarSign size={22} color="var(--tt-color-success)" />;
    if (c.includes('GARANTIA') || c.includes('PRIORIDAD')) return <Shield size={22} color="var(--tt-color-warning)" />;
    if (c.includes('SOPORTE')) return <Zap size={22} color="var(--tt-color-primary)" />;
    return <Gift size={22} color="#eab308" />;
  };

  if (beneficios.length === 0) {
    return null;
  }

  return (
    <div style={{ margin: '1.75rem 0' }}>
      <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Award size={20} color="var(--tt-color-primary)" />
        <span>Beneficios Oficiales de la Membresía TechTail Prime</span>
      </h3>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        {beneficios.map((item, idx) => (
          <div
            key={item.codigo || idx}
            style={{
              backgroundColor: 'var(--tt-color-surface)',
              border: '1px solid var(--tt-color-border)',
              borderRadius: '0.75rem',
              padding: '1.25rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '0.5rem',
                  backgroundColor: 'rgba(14, 165, 233, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {getIconForBenefit(item.codigo)}
              </div>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, margin: 0, color: 'var(--tt-color-text-main)' }}>
                {item.nombre}
              </h4>
            </div>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--tt-color-text-muted)', lineHeight: 1.4 }}>
              {item.descripcion}
            </p>
            {item.valor && (
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--tt-color-primary)', marginTop: 'auto' }}>
                Valor oficial: {item.valor}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
