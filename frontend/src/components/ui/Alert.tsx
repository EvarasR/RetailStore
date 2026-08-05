import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle, Info } from 'lucide-react';

export type AlertVariant = 'info' | 'warning' | 'error' | 'success';

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  variant = 'info',
  title,
  children,
  className = '',
}) => {
  const getStyles = () => {
    switch (variant) {
      case 'error':
        return {
          bg: 'rgba(239, 68, 68, 0.08)',
          border: 'rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          icon: <AlertCircle size={20} color="#ef4444" />,
        };
      case 'warning':
        return {
          bg: 'rgba(245, 158, 11, 0.08)',
          border: 'rgba(245, 158, 11, 0.3)',
          color: '#f59e0b',
          icon: <AlertTriangle size={20} color="#f59e0b" />,
        };
      case 'success':
        return {
          bg: 'rgba(16, 185, 129, 0.08)',
          border: 'rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          icon: <CheckCircle size={20} color="#10b981" />,
        };
      default:
        return {
          bg: 'rgba(59, 130, 246, 0.08)',
          border: 'rgba(59, 130, 246, 0.3)',
          color: '#3b82f6',
          icon: <Info size={20} color="#3b82f6" />,
        };
    }
  };

  const { bg, border, color, icon } = getStyles();

  return (
    <div
      className={`tt-alert ${className}`}
      style={{
        backgroundColor: bg,
        border: `1px solid ${border}`,
        borderRadius: '0.75rem',
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '0.75rem',
      }}
      role="alert"
    >
      <div style={{ flexShrink: 0, marginTop: '0.125rem' }}>{icon}</div>
      <div style={{ flex: 1 }}>
        {title && (
          <h4
            style={{
              fontSize: '0.9375rem',
              fontWeight: 700,
              color: color,
              marginBottom: '0.25rem',
            }}
          >
            {title}
          </h4>
        )}
        <div style={{ fontSize: '0.875rem', color: 'var(--tt-color-text)', lineHeight: '1.5' }}>
          {children}
        </div>
      </div>
    </div>
  );
};
