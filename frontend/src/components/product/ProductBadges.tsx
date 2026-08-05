import React from 'react';
import { Zap, Tag, Sparkles, Clock, ShieldCheck } from 'lucide-react';

export interface ProductBadgesProps {
  es_prime?: boolean;
  descuento?: string | null;
  stock_disponible?: number | null;
  estado?: string;
  isNew?: boolean;
  className?: string;
}

export const ProductBadges: React.FC<ProductBadgesProps> = ({
  es_prime,
  descuento,
  stock_disponible,
  estado,
  isNew = false,
  className = '',
}) => {
  const isLowStock = typeof stock_disponible === 'number' && stock_disponible > 0 && stock_disponible <= 5;

  return (
    <div className={`tt-product-badges ${className}`}>
      {es_prime && (
        <span className="tt-product-badge tt-product-badge--prime" title="Envío gratis y prioritario TechTail Prime">
          <Zap size={13} className="tt-product-badge__icon" />
          <span>Prime</span>
        </span>
      )}

      {descuento && (
        <span className="tt-product-badge tt-product-badge--discount">
          <Tag size={13} className="tt-product-badge__icon" />
          <span>{descuento} OFERTA</span>
        </span>
      )}

      {isNew && (
        <span className="tt-product-badge tt-product-badge--new">
          <Sparkles size={13} className="tt-product-badge__icon" />
          <span>NUEVO</span>
        </span>
      )}

      {isLowStock && (
        <span className="tt-product-badge tt-product-badge--warning">
          <Clock size={13} className="tt-product-badge__icon" />
          <span>¡Últimas {stock_disponible} unidades!</span>
        </span>
      )}

      {estado === 'DESTACADO' && (
        <span className="tt-product-badge tt-product-badge--featured">
          <ShieldCheck size={13} className="tt-product-badge__icon" />
          <span>RECOMENDADO</span>
        </span>
      )}
    </div>
  );
};
