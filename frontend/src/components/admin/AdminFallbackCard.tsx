import React from 'react';
import { ExternalLink, ShieldAlert } from 'lucide-react';

interface AdminFallbackCardProps {
  title: string;
  description: string;
  classicPath?: string;
  actionText?: string;
}

export const AdminFallbackCard: React.FC<AdminFallbackCardProps> = ({
  title,
  description,
  classicPath = '/panel/',
  actionText = 'Abrir Panel Clásico Django',
}) => {
  return (
    <div
      style={{
        background: 'var(--color-bg-secondary)',
        border: '1px solid var(--color-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        margin: '1.5rem 0',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.875rem', flex: 1, minWidth: '240px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            background: 'rgba(217, 119, 6, 0.12)',
            color: 'var(--color-warning)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <ShieldAlert size={20} />
        </div>
        <div>
          <h4
            style={{
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'var(--color-text)',
              margin: '0 0 0.25rem 0',
            }}
          >
            {title}
          </h4>
          <p
            style={{
              fontSize: '0.825rem',
              color: 'var(--color-text-muted)',
              margin: 0,
              lineHeight: 1.4,
            }}
          >
            {description}
          </p>
        </div>
      </div>

      <a
        href={classicPath}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.625rem 1rem',
          background: 'var(--color-surface)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text)',
          fontSize: '0.825rem',
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'all 0.2s ease',
          whiteSpace: 'nowrap',
        }}
      >
        <span>{actionText}</span>
        <ExternalLink size={14} />
      </a>
    </div>
  );
};
