import React from 'react';
import emptySvg from '../../assets/empty-results.svg';
import { Button } from './Button';

export interface EmptyStateProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No encontramos productos que coincidan con tu búsqueda',
  description = 'Intenta comprobar la ortografía o usar filtros más generales para explorar nuestro catálogo de servidores, redes y hardware.',
  actionText = 'Ver Todo el Catálogo',
  onAction,
  className = '',
}) => {
  return (
    <div className={`tt-empty-state ${className}`.trim()}>
      <img src={emptySvg} alt="Sin resultados TechTail" />
      <h3 className="tt-empty-state__title">{title}</h3>
      <p className="tt-empty-state__description">{description}</p>
      {onAction && (
        <div style={{ marginTop: '0.75rem' }}>
          <Button variant="primary" onClick={onAction}>
            {actionText}
          </Button>
        </div>
      )}
    </div>
  );
};
