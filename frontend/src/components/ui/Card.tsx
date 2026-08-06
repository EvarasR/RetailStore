import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hoverable?: boolean;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  hoverable = false,
  className = '',
  ...rest
}) => {
  const baseClass = 'tt-card';
  const hoverClass = hoverable ? 'tt-card--hoverable' : '';
  return (
    <div className={`${baseClass} ${hoverClass} ${className}`.trim()} {...rest}>
      {children}
    </div>
  );
};
