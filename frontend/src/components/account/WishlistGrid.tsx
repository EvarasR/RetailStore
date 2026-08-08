import React from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ShoppingCart, ExternalLink, HeartOff } from 'lucide-react';
import type { ProductItem } from '../../api/products.api';

interface WishlistGridProps {
  products: ProductItem[];
  onRemove: (cod_producto: number) => Promise<unknown>;
  removingId?: number | null;
}

export const WishlistGrid: React.FC<WishlistGridProps> = ({
  products,
  onRemove,
  removingId = null,
}) => {
  if (!products || products.length === 0) {
    return (
      <div className="tt-empty-state" style={{ padding: '4rem 1rem', textAlign: 'center', backgroundColor: 'var(--tt-color-surface)', borderRadius: '0.75rem', border: '1px dashed var(--tt-color-border)' }}>
        <HeartOff size={44} color="var(--tt-color-text-light)" style={{ margin: '0 auto 1rem' }} />
        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Tu Wishlist está vacía</h3>
        <p style={{ color: 'var(--tt-color-text-muted)', maxWidth: '420px', margin: '0 auto 1.5rem', fontSize: '0.9rem' }}>
          Aún no has guardado productos en tus favoritos. Explora nuestro catálogo y presiona el ícono de corazón para guardarlos aquí.
        </p>
        <Link to="/catalogo" className="tt-btn tt-btn--primary">
          Explorar Catálogo TechTail
        </Link>
      </div>
    );
  }

  return (
    <div className="tt-wishlist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem' }}>
      {products.map((p) => {
        const isRemoving = removingId === p.cod_producto;
        return (
          <div key={p.cod_producto} className="tt-product-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
            <button
              type="button"
              onClick={() => onRemove(p.cod_producto)}
              className="tt-btn tt-btn--ghost"
              style={{
                position: 'absolute',
                top: '0.5rem',
                right: '0.5rem',
                zIndex: 2,
                backgroundColor: 'var(--tt-color-surface)',
                border: '1px solid var(--tt-color-border)',
                padding: '0.4rem',
                borderRadius: '50%',
                color: 'var(--tt-color-error)',
              }}
              title="Quitar de favoritos"
              aria-label={`Quitar ${p.nombre} de favoritos`}
              disabled={isRemoving}
            >
              <Trash2 size={16} />
            </button>

            <Link to={`/producto/${p.cod_producto}`} className="tt-product-card__img-wrap" style={{ display: 'block', padding: '1rem', textAlign: 'center' }}>
              <img
                src={p.imagen}
                alt={p.nombre}
                style={{ width: '100%', height: '180px', objectFit: 'contain', margin: '0 auto' }}
              />
            </Link>

            <div className="tt-product-card__content" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-primary)', fontWeight: 600 }}>{p.marca || p.categoria}</span>
              <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, margin: '0.3rem 0 0.5rem', lineHeight: 1.3 }}>
                <Link to={`/producto/${p.cod_producto}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                  {p.nombre}
                </Link>
              </h3>
              <div style={{ marginTop: 'auto', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--tt-color-border)' }}>
                <div>
                  <span style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--tt-color-text-main)' }}>
                    {p.precio_final || p.precio_actual}
                  </span>
                  {p.tiene_descuento && (
                    <span style={{ display: 'block', fontSize: '0.75rem', color: 'var(--tt-color-text-light)', textDecoration: 'line-through' }}>
                      {p.precio_normal}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <Link
                    to={`/producto/${p.cod_producto}`}
                    className="tt-btn tt-btn--secondary"
                    style={{ padding: '0.4rem 0.6rem', fontSize: '0.75rem' }}
                    title="Ver detalle del producto"
                  >
                    <ExternalLink size={15} />
                  </Link>
                  <Link
                    to={`/producto/${p.cod_producto}`}
                    className="tt-btn tt-btn--primary"
                    style={{ padding: '0.4rem 0.7rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                  >
                    <ShoppingCart size={15} />
                    <span>Comprar</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
