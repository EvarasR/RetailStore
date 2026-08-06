import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Heart, ShoppingCart, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import type { ProductItem } from '../../api/products.api';
import placeholderSvg from '../../assets/product-placeholder.svg';

export interface ProductCardProps {
  product: ProductItem;
  onAddToCart?: (product: ProductItem) => void;
  onWishlistToggle?: (product: ProductItem) => void;
  className?: string;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onWishlistToggle,
  className = '',
}) => {
  const [imgError, setImgError] = useState(false);
  const [addedVisual, setAddedVisual] = useState(false);
  const [wishlistVisual, setWishlistVisual] = useState(false);

  const handleImgError = () => {
    setImgError(true);
  };

  const handleAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setAddedVisual(true);
    setTimeout(() => setAddedVisual(false), 1800);
    if (onAddToCart) {
      onAddToCart(product);
    }
  };

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlistVisual(!wishlistVisual);
    if (onWishlistToggle) {
      onWishlistToggle(product);
    }
  };

  const isOutOfStock = product.stock_disponible === 0;
  const isLowStock =
    product.stock_disponible !== null &&
    product.stock_disponible !== undefined &&
    product.stock_disponible > 0 &&
    product.stock_disponible <= 5;

  const precioMostrar = product.precio_final || product.precio_actual || '0.00';
  const precioAnterior = product.precio_anterior;

  return (
    <article className={`tt-product-card ${className}`.trim()}>
      {/* Badges y Etiquetas Superiores (Limpio y sutil) */}
      <div className="tt-product-card__badges">
        {product.descuento && (
          <span
            style={{
              backgroundColor: '#fef2f2',
              color: '#dc2626',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.5rem',
              borderRadius: '4px',
              border: '1px solid #fecdd3',
              textTransform: 'uppercase',
              letterSpacing: '0.02em',
            }}
          >
            {product.descuento}
          </span>
        )}
        {product.es_prime && (
          <span
            style={{
              backgroundColor: '#e0f2fe',
              color: '#0369a1',
              fontSize: '0.7rem',
              fontWeight: 700,
              padding: '0.2rem 0.5rem',
              borderRadius: '4px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem',
              border: '1px solid #bae6fd',
            }}
          >
            <ShieldCheck size={12} color="#0284c7" />
            <span>PRIME</span>
          </span>
        )}
      </div>

      {/* Botón de Lista de Deseos */}
      <button
        type="button"
        className="tt-product-card__wishlist"
        onClick={handleWishlistClick}
        aria-label="Agregar a lista de deseos"
        title="Guardar en favoritos"
      >
        <Heart
          size={16}
          fill={wishlistVisual ? '#dc2626' : 'none'}
          color={wishlistVisual ? '#dc2626' : '#64748b'}
        />
      </button>

      {/* Contenedor de Imagen de Producto */}
      <Link
        to={`/producto/${product.cod_producto}`}
        className="tt-product-card__image-container"
        aria-label={`Ver detalle de ${product.nombre}`}
      >
        <img
          src={imgError ? placeholderSvg : (product.imagen || placeholderSvg)}
          alt={product.nombre}
          className="tt-product-card__image"
          onError={handleImgError}
          loading="lazy"
        />
      </Link>

      {/* Cuerpo del Producto */}
      <div className="tt-product-card__body">
        <div className="tt-product-card__meta">
          <span>{product.marca || 'GENÉRICO'}</span>
          <span>{product.categoria || 'HARDWARE'}</span>
        </div>

        <Link
          to={`/producto/${product.cod_producto}`}
          style={{ textDecoration: 'none' }}
        >
          <h3 className="tt-product-card__title" title={product.nombre}>
            {product.nombre}
          </h3>
        </Link>

        {/* Calificación y Reseñas */}
        <div className="tt-product-card__rating">
          <div className="tt-product-card__stars">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                size={13}
                fill={
                  product.rating && i < Math.floor(product.rating)
                    ? '#f59e0b'
                    : 'none'
                }
                color={
                  product.rating && i < Math.floor(product.rating)
                    ? '#f59e0b'
                    : '#cbd5e1'
                }
              />
            ))}
          </div>
          <span className="tt-product-card__reviews">
            ({product.num_resenas || 0})
          </span>
        </div>

        {/* Bloque de Precios y Stock */}
        <div className="tt-product-card__price-box">
          <div className="tt-product-card__price-row">
            <span className="tt-product-card__price">${precioMostrar}</span>
            {precioAnterior && (
              <span className="tt-product-card__old-price">
                ${precioAnterior}
              </span>
            )}
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              marginTop: '0.2rem',
            }}
          >
            <span
              style={{
                fontWeight: 600,
                color: isOutOfStock
                  ? '#dc2626'
                  : isLowStock
                  ? '#d97706'
                  : '#059669',
              }}
            >
              {isOutOfStock
                ? 'Agotado'
                : isLowStock
                ? '¡Últimas unidades!'
                : 'En stock'}
            </span>
            {product.sku && (
              <span style={{ color: '#94a3b8', fontSize: '0.7rem' }}>
                SKU: {product.sku}
              </span>
            )}
          </div>

          {/* Botones de Acción */}
          <div style={{ marginTop: '0.75rem' }}>
            {isOutOfStock ? (
              <button
                type="button"
                disabled
                className="tt-btn--secondary"
                style={{ width: '100%', opacity: 0.5, cursor: 'not-allowed' }}
              >
                <AlertCircle size={15} />
                <span>No disponible</span>
              </button>
            ) : addedVisual ? (
              <button
                type="button"
                className="tt-btn--secondary"
                style={{
                  width: '100%',
                  backgroundColor: '#059669',
                  color: '#ffffff',
                  borderColor: '#059669',
                }}
              >
                <CheckCircle2 size={15} />
                <span>¡Agregado!</span>
              </button>
            ) : (
              <button
                type="button"
                className="tt-btn--cta"
                style={{ width: '100%' }}
                onClick={handleAddClick}
              >
                <ShoppingCart size={16} />
                <span>Agregar al Carrito</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
};
