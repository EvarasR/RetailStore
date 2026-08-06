import React from 'react';
import { Rating } from '../ui/Rating';
import { ProductBadges } from './ProductBadges';
import type { ProductDetail } from '../../api/products.api';

export interface ProductInfoProps {
  product: ProductDetail;
  onReviewsClick?: () => void;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product, onReviewsClick }) => {
  const isNew = product.estado === 'NUEVO';
  const displayAttributes = (product.atributos || []).slice(0, 4);

  return (
    <div className="tt-product-info">
      {/* Marca y Categoría */}
      <div className="tt-product-info__meta-header">
        {product.marca && (
          <span className="tt-product-info__brand">
            Visitar la tienda de <strong style={{ color: 'var(--tt-color-brand)' }}>{product.marca}</strong>
          </span>
        )}
        {product.categoria && (
          <span className="tt-product-info__category-tag">{product.categoria}</span>
        )}
      </div>

      {/* Título y Badges */}
      <h1 className="tt-product-info__title">{product.nombre}</h1>

      <div className="tt-product-info__badges-row">
        <ProductBadges
          es_prime={product.es_prime}
          descuento={product.descuento}
          stock_disponible={product.stock_disponible}
          estado={product.estado}
          isNew={isNew}
        />
        {product.sku && (
          <span className="tt-product-info__sku">SKU: {product.sku}</span>
        )}
      </div>

      {/* Rating y Reseñas */}
      <div className="tt-product-info__rating-row">
        <Rating
          value={product.rating || 4.8}
          count={product.num_resenas}
          onCountClick={onReviewsClick}
        />
        <span className="tt-product-info__separator">•</span>
        <span className="tt-product-info__verified-badge">
          Calidad Verificada TechTail
        </span>
      </div>

      <hr className="tt-product-info__divider" />

      {/* Precio Protagonista */}
      <div className="tt-product-info__pricing">
        <div className="tt-product-info__price-main">
          <span className="tt-product-info__price-label">Precio:</span>
          <span className="tt-product-info__price-val">{product.precio_final || product.precio_actual}</span>
          {product.descuento && (
            <span className="tt-product-info__discount-pill">{product.descuento}</span>
          )}
        </div>
        {product.precio_anterior && (
          <div className="tt-product-info__price-old">
            Precio recomendado: <del>{product.precio_anterior}</del>
          </div>
        )}
        <div className="tt-product-info__tax-note">
          Todos los precios incluyen impuestos locales según facturación y destino.
        </div>
      </div>

      {/* Descripción corta */}
      {product.descripcion && (
        <div className="tt-product-info__description">
          <p>{product.descripcion}</p>
        </div>
      )}

      {/* Resumen de atributos clave */}
      {displayAttributes.length > 0 && (
        <div className="tt-product-info__key-attrs">
          <h4 className="tt-product-info__key-attrs-title">Especificaciones Destacadas:</h4>
          <dl className="tt-product-info__key-attrs-grid">
            {displayAttributes.map((attr, idx) => (
              <div key={idx} className="tt-product-info__key-attr">
                <dt>{attr.nombre}:</dt>
                <dd>{attr.valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
};
