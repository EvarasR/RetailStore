import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

interface AccountSummaryCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  to: string;
  icon: React.ComponentType<{ size?: number; className?: string; color?: string }>;
}

export const AccountSummaryCard: React.FC<AccountSummaryCardProps> = ({
  title,
  value,
  subtitle,
  to,
  icon: Icon,
}) => {
  return (
    <Link to={to} className="tt-account-summary-card">
      <div className="tt-account-summary-card__header">
        <div className="tt-account-summary-card__icon-wrapper">
          <Icon size={22} color="var(--tt-color-primary)" />
        </div>
        <span className="tt-account-summary-card__title">{title}</span>
      </div>
      <div className="tt-account-summary-card__body">
        <span className="tt-account-summary-card__value">{value}</span>
        <span className="tt-account-summary-card__subtitle">{subtitle}</span>
      </div>
      <div className="tt-account-summary-card__footer">
        <span>Gestionar</span>
        <ArrowRight size={14} />
      </div>
    </Link>
  );
};
