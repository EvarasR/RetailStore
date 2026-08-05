import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import type { ProductItem } from '../../api/products.api';
import { ProductCard } from './ProductCard';
import { Skeleton } from '../ui/Skeleton';

export interface ProductCarouselProps {
  title: string;
  products: ProductItem[];
  loading?: boolean;
  linkTo?: string;
  icon?: React.ReactNode;
  onAddToCart?: (product: ProductItem) => void;
  onWishlistToggle?: (product: ProductItem) => void;
  className?: string;
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  title,
  products,
  loading = false,
  linkTo,
  icon,
  onAddToCart,
  onWishlistToggle,
  className = '',
}) => {
  const trackRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: -600, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (trackRef.current) {
      trackRef.current.scrollBy({ left: 600, behavior: 'smooth' });
    }
  };

  return (
    <section className={`tt-carousel-section ${className}`.trim()}>
      <header className="tt-carousel-header">
        <h2 className="tt-carousel-title">
          {icon && <span style={{ display: 'inline-flex', color: 'var(--tt-color-primary)' }}>{icon}</span>}
          <span>{title}</span>
        </h2>

        <div className="tt-carousel-actions">
          {linkTo && (
            <Link
              to={linkTo}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: 'var(--tt-color-primary)',
                marginRight: '0.5rem',
                textDecoration: 'none',
              }}
            >
              <span>Ver Todo</span>
              <ArrowRight size={16} />
            </Link>
          )}

          <button
            type="button"
            className="tt-carousel-arrow"
            onClick={scrollLeft}
            aria-label="Desplazar carrusel hacia la izquierda"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            className="tt-carousel-arrow"
            onClick={scrollRight}
            aria-label="Desplazar carrusel hacia la derecha"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </header>

      <div ref={trackRef} className="tt-carousel-track">
        {loading ? (
          Array.from({ length: 4 }).map((_, idx) => (
            <div key={idx} className="tt-carousel-item">
              <Skeleton type="card" />
            </div>
          ))
        ) : products && products.length > 0 ? (
          products.map((item) => (
            <div key={item.cod_producto} className="tt-carousel-item">
              <ProductCard
                product={item}
                onAddToCart={onAddToCart}
                onWishlistToggle={onWishlistToggle}
              />
            </div>
          ))
        ) : (
          <div style={{ padding: '2rem 1rem', color: 'var(--tt-color-text-muted)', fontSize: '0.9375rem' }}>
            No hay productos disponibles en esta sección por el momento.
          </div>
        )}
      </div>
    </section>
  );
};
