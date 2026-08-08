import React from 'react';
import { Inbox } from 'lucide-react';

interface AdminEmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export const AdminEmptyState: React.FC<AdminEmptyStateProps> = ({
  title,
  description,
  action,
}) => {
  return (
    <div className="admin-empty-state">
      <Inbox size={48} className="text-slate-500 opacity-60" />
      <div style={{ maxWidth: '400px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: '0 0 0.4rem 0', color: 'var(--tt-color-text-main)' }}>
          {title}
        </h3>
        {description && (
          <p style={{ fontSize: '0.875rem', color: 'var(--tt-color-text-light)', margin: 0 }}>
            {description}
          </p>
        )}
      </div>
      {action && <div style={{ marginTop: '1rem' }}>{action}</div>}
    </div>
  );
};
