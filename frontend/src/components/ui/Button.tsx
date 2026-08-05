import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'prime';
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  children,
  icon,
  className = '',
  ...rest
}) => {
  return (
    <button
      className={`tt-btn tt-btn--${variant} ${className}`.trim()}
      {...rest}
    >
      {icon && <span className="tt-btn__icon">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
