import React from 'react';
import { ShieldCheck, Percent } from 'lucide-react';

export interface BadgeProps {
  variant?: 'prime' | 'discount' | 'primary' | 'success' | 'default';
  children: React.ReactNode;
  icon?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default',
  children,
  icon = false,
  className = '',
}) => {
  return (
    <span className={`tt-badge tt-badge--${variant} ${className}`.trim()}>
      {icon && variant === 'prime' && <ShieldCheck size={12} />}
      {icon && variant === 'discount' && <Percent size={11} />}
      <span>{children}</span>
    </span>
  );
};
