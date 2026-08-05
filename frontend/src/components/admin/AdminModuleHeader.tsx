import React from 'react';
import { RefreshCw, ExternalLink } from 'lucide-react';

interface AdminModuleHeaderProps {
  title: string;
  subtitle: string;
  onReload?: () => void;
  loading?: boolean;
  classicPath?: string;
}

export const AdminModuleHeader: React.FC<AdminModuleHeaderProps> = ({
  title,
  subtitle,
  onReload,
  loading = false,
  classicPath = '/panel/',
}) => {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--color-border)',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--color-text)',
            margin: '0 0 0.25rem 0',
          }}
        >
          {title}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', margin: 0 }}>
          {subtitle}
        </p>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {onReload && (
          <button
            type="button"
            onClick={onReload}
            disabled={loading}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 0.875rem',
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-md)',
              color: 'var(--color-text)',
              fontSize: '0.825rem',
              fontWeight: 500,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
            }}
          >
            <RefreshCw size={14} className={loading ? 'spin-anim' : ''} />
            <span>Actualizar</span>
          </button>
        )}

        <a
          href={classicPath}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.875rem',
            background: 'var(--color-primary)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: '#fff',
            fontSize: '0.825rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <span>Abrir Panel Clásico</span>
          <ExternalLink size={14} />
        </a>
      </div>
    </div>
  );
};
