import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface AdminMetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
}

export const AdminMetricCard: React.FC<AdminMetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
}) => {
  return (
    <div className="admin-metric-card">
      <div className="admin-metric-header">
        <span>{title}</span>
        {Icon && <Icon size={20} className="text-blue-400" />}
      </div>
      <div className="admin-metric-value">{value}</div>
      {subtitle && <div className="admin-metric-subtitle">{subtitle}</div>}
    </div>
  );
};
