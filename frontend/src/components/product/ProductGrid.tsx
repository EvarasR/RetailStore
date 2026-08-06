import React from 'react';
import type { ProductItem } from '../../api/products.api';
import { ProductCard } from './ProductCard';
import { Skeleton } from '../ui/Skeleton';
import { EmptyState } from '../ui/EmptyState';

export interface ProductGridProps {
  products: ProductItem[];
  loading?: boolean;
  viewMode?: 'grid' | 'list';
  emptyTitle?: string;
  emptyDescription?: string;
  onResetFilters?: () => void;
  onAddToCart?: (product: ProductItem) => void;
  onWishlistToggle?: (product: ProductItem) => void;
  className?: string;
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  viewMode = 'grid',
  emptyTitle,
  emptyDescription,
  onResetFilters,
  onAddToCart,
  onWishlistToggle,
  className = '',
}) => {
  const gridClass = viewMode === 'list'
    ? 'tt-product-grid tt-product-grid--list'
    : 'tt-product-grid';

  if (loading) {
    return (
      <div className={`${gridClass} ${className}`.trim()}>
        {Array.from({ length: 12 }).map((_, idx) => (
          <Skeleton key={idx} type="card" />
        ))}
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <EmptyState
        title={emptyTitle || 'No encontramos productos que coincidan'}
        description={
          emptyDescription ||
          'Verifica tus filtros, intenta usar términos más generales o limpia la búsqueda actual para ver todo el catálogo.'
        }
        onAction={onResetFilters}
      />
    );
  }

  return (
    <div
      className={`${gridClass} ${className}`.trim()}
      style={
        viewMode === 'list'
          ? {
              display: 'grid',
              gridTemplateColumns: '1fr',
              gap: '1.25rem',
            }
          : undefined
      }
    >
      {products.map((product) => (
        <ProductCard
          key={product.cod_producto}
          product={product}
          onAddToCart={onAddToCart}
          onWishlistToggle={onWishlistToggle}
        />
      ))}
    </div>
  );
};
