import React from 'react';
import { RefreshCw } from 'lucide-react';

interface AdminModuleHeaderProps {
  title: string;
  subtitle: string;
  onReload?: () => void;
  loading?: boolean;
}

export const AdminModuleHeader: React.FC<AdminModuleHeaderProps> = ({
  title,
  subtitle,
  onReload,
  loading = false,
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
        borderBottom: '1px solid var(--tt-color-border)',
      }}
    >
      <div>
        <h1
          style={{
            fontSize: '1.5rem',
            fontWeight: 700,
            color: 'var(--tt-color-text-main)',
            margin: '0 0 0.25rem 0',
          }}
        >
          {title}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--tt-color-text-muted)', margin: 0 }}>
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
              background: 'var(--tt-color-surface)',
              border: '1px solid var(--tt-color-border)',
              borderRadius: 'var(--tt-radius-md)',
              color: 'var(--tt-color-text-main)',
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

      </div>
    </div>
  );
};
