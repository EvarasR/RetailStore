import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({ items, className = '' }) => {
  return (
    <nav aria-label="Breadcrumb" className={`tt-breadcrumb ${className}`}>
      <ol className="tt-breadcrumb__list">
        <li className="tt-breadcrumb__item">
          <Link to="/" className="tt-breadcrumb__link" title="Inicio TechTail">
            <Home size={14} />
            <span>Inicio</span>
          </Link>
        </li>
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          return (
            <li key={idx} className="tt-breadcrumb__item">
              <ChevronRight size={14} className="tt-breadcrumb__separator" />
              {isLast || !item.href ? (
                <span className="tt-breadcrumb__current" aria-current="page">
                  {item.label}
                </span>
              ) : (
                <Link to={item.href} className="tt-breadcrumb__link">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
