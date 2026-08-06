import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight } from 'lucide-react';

interface DjangoFallbackPageProps {
  title: string;
  description: string;
  djangoUrl: string;
}

export const DjangoFallbackPage: React.FC<DjangoFallbackPageProps> = ({
  title,
  description,
  djangoUrl,
}) => {
  return (
    <div className="tt-container" style={{ padding: '4rem 1.5rem', display: 'flex', justifyContent: 'center' }}>
      <div className="tt-card" style={{ width: '100%', maxWidth: '560px', padding: '2.5rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', padding: '0.75rem', backgroundColor: 'var(--tt-color-surface)', borderRadius: '9999px', marginBottom: '1.25rem' }}>
          <ShieldCheck size={36} color="var(--tt-color-primary)" />
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          {title}
        </h1>

        <p style={{ color: 'var(--tt-color-text-light)', fontSize: '0.9375rem', lineHeight: '1.6', marginBottom: '2rem' }}>
          {description}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          <a
            href={djangoUrl}
            style={{
              backgroundColor: 'var(--tt-color-primary)',
              color: '#ffffff',
              padding: '0.875rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: 700,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
            }}
          >
            Acceder en versión clásica Django ({djangoUrl}) <ArrowRight size={18} />
          </a>

          <Link
            to="/"
            style={{
              backgroundColor: 'var(--tt-color-surface)',
              color: 'var(--tt-color-text)',
              border: '1px solid var(--tt-color-border)',
              padding: '0.75rem 1.5rem',
              borderRadius: '0.5rem',
              fontWeight: 600,
              fontSize: '0.875rem',
            }}
          >
            Volver al inicio en React
          </Link>
        </div>
      </div>
    </div>
  );
};
