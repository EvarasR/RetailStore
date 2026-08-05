import React from 'react';
import { Truck, Clock, Sparkles, CheckCircle2 } from 'lucide-react';
import type { ShippingMethod } from '../../types/checkout.types';

interface ShippingMethodSelectorProps {
  methods: ShippingMethod[];
  selectedMethodId: number | null;
  onSelectMethod: (id: number) => void;
  loading?: boolean;
}

export const ShippingMethodSelector: React.FC<ShippingMethodSelectorProps> = ({
  methods,
  selectedMethodId,
  onSelectMethod,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Truck size={20} color="var(--tt-color-primary)" /> Selecciona el Método de Envío
        </h3>
        <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
          Tiempos estimados de despacho corporativo según la cotización oficial de PostgreSQL.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
        {methods.map((method) => {
          const isSelected = selectedMethodId === method.cod_metodo_envio;
          return (
            <div
              key={method.cod_metodo_envio}
              onClick={() => onSelectMethod(method.cod_metodo_envio)}
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
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '0.5rem',
                    backgroundColor: isSelected ? 'var(--tt-color-primary)' : 'rgba(100, 116, 139, 0.1)',
                    color: isSelected ? '#ffffff' : '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Truck size={22} />
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--tt-color-text)' }}>
                      {method.nombre}
                    </span>
                    {method.es_premium_gratis && (
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          backgroundColor: '#f59e0b',
                          color: '#ffffff',
                          padding: '0.125rem 0.375rem',
                          borderRadius: '0.25rem',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                        }}
                      >
                        <Sparkles size={12} /> Prime Gratis
                      </span>
                    )}
                  </div>

                  <div
                    style={{
                      fontSize: '0.8125rem',
                      color: '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.375rem',
                      marginTop: '0.25rem',
                    }}
                  >
                    <Clock size={14} /> Entrega estimada: de {method.dias_min} a {method.dias_max} días hábiles
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--tt-color-text)' }}>
                    ${method.costo_base}
                  </span>
                  <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Tarifa base DB</div>
                </div>
                {isSelected && <CheckCircle2 size={20} color="var(--tt-color-primary)" />}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
