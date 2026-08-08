import React from 'react';
import { Link } from 'react-router-dom';
import { UserCheck, ShieldCheck, Sparkles, LogIn, ArrowRight } from 'lucide-react';

interface CheckoutSessionStepProps {
  isAuthenticated: boolean;
  usuario: Record<string, any> | null;
  es_prime: boolean;
  roles?: string[];
  onNext: () => void;
}

export const CheckoutSessionStep: React.FC<CheckoutSessionStepProps> = ({
  isAuthenticated,
  usuario,
  es_prime,
  roles = [],
  onNext,
}) => {
  if (!isAuthenticated) {
    return (
      <div
        className="tt-card"
        style={{
          padding: '3rem 2rem',
          textAlign: 'center',
          maxWidth: '560px',
          margin: '1rem auto',
        }}
      >
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
          }}
        >
          <LogIn size={32} color="var(--tt-color-primary)" />
        </div>

        <h3 style={{ fontSize: '1.375rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Identificación requerida para Checkout TechTail
        </h3>

        <p
          style={{
            color: 'var(--tt-color-text-muted)',
            fontSize: '0.9375rem',
            lineHeight: '1.6',
            marginBottom: '2rem',
            maxWidth: '440px',
            margin: '0 auto 2rem',
          }}
        >
          Para garantizar la seguridad transaccional ACID de tu pedido, calcular tarifas tributarias y aplicar beneficios empresariales o membresía Prime, necesitas iniciar sesión en tu cuenta.
        </p>

        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link
            to="/login"
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
              boxShadow: '0 4px 12px rgba(59, 130, 246, 0.25)',
            }}
          >
            <LogIn size={18} /> Iniciar Sesión en TechTail
          </Link>

          <Link
            to="/catalogo"
            style={{
              backgroundColor: 'var(--tt-color-surface)',
              color: 'var(--tt-color-text-main)',
              border: '1px solid var(--tt-color-border)',
              padding: '0.875rem 1.75rem',
              borderRadius: '0.5rem',
              fontWeight: 700,
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
            }}
          >
            Volver al Catálogo
          </Link>
        </div>
      </div>
    );
  }

  const nombreMostrar = usuario?.nombres || usuario?.full_name || usuario?.email || 'Usuario de TechTail';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UserCheck size={20} color="var(--tt-color-primary)" /> Sesión Activa de Checkout
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--tt-color-text-muted)' }}>
          Sesión segura verificada para continuar con la compra.
        </p>
      </div>

      <div
        className="tt-card"
        style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          borderLeft: '4px solid var(--tt-color-primary)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <span
              style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                color: 'var(--tt-color-text-muted)',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '0.25rem',
              }}
            >
              TITULAR DE LA CUENTA
            </span>
            <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--tt-color-text-main)' }}>
              {nombreMostrar}
            </div>
            {usuario?.email && (
              <div style={{ fontSize: '0.875rem', color: 'var(--tt-color-text-muted)', marginTop: '0.125rem' }}>
                Email de facturación: {usuario.email}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {es_prime ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  backgroundColor: 'var(--tt-color-warning)',
                  color: '#ffffff',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                }}
              >
                <Sparkles size={14} /> MEMBRESÍA PRIME ACTIVA
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.375rem',
                  backgroundColor: 'var(--tt-color-text-muted)',
                  color: '#ffffff',
                  padding: '0.375rem 0.75rem',
                  borderRadius: '9999px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                CUENTA ESTÁNDAR
              </span>
            )}
          </div>
        </div>

        {roles && roles.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-muted)', fontWeight: 600 }}>Roles asignados en DB:</span>
            {roles.map((r, idx) => (
              <span
                key={idx}
                style={{
                  fontSize: '0.75rem',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: 'var(--tt-color-primary)',
                  padding: '0.125rem 0.5rem',
                  borderRadius: '0.25rem',
                  fontWeight: 700,
                }}
              >
                {r}
              </span>
            ))}
          </div>
        )}

        <div
          style={{
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.8125rem',
            color: 'var(--tt-color-success)',
          }}
        >
          <ShieldCheck size={18} style={{ flexShrink: 0 }} />
          <span>
            Identidad corporativa verificada con cookies seguras y CSRF en Django 5.
          </span>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
        <button
          type="button"
          onClick={onNext}
          style={{
            backgroundColor: 'var(--tt-color-primary)',
            color: '#ffffff',
            border: 'none',
            borderRadius: '0.75rem',
            padding: '1rem 2rem',
            fontSize: '1rem',
            fontWeight: 700,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 14px rgba(59, 130, 246, 0.25)',
            transition: 'background-color 0.2s ease',
          }}
        >
          Continuar al Paso 2: Dirección <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
};
