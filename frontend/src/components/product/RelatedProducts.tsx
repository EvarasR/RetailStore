import React from 'react';
import { Link } from 'react-router-dom';
import { Layers } from 'lucide-react';
import type { ProductRelated } from '../../api/products.api';
import placeholderUrl from '../../assets/placeholder-product.svg';

export interface RelatedProductsProps {
  relacionados: ProductRelated[];
}

export const RelatedProducts: React.FC<RelatedProductsProps> = ({ relacionados = [] }) => {
  if (!relacionados || relacionados.length === 0) {
    return null; // Si no hay relacionados desde backend, ocultamos la sección limpiamente
  }

  return (
    <section className="tt-related-products" aria-labelledby="related-heading">
      <div className="tt-related-products__header">
        <Layers size={20} className="tt-related-products__icon" />
        <h3 id="related-heading" className="tt-related-products__title">
          Productos Relacionados y Complementos de Infraestructura
        </h3>
      </div>

      <div className="tt-related-products__grid">
        {relacionados.map((item, idx) => {
          const imgUrl = item.imagen || placeholderUrl;
          return (
            <Link
              key={idx}
              to={`/producto/${item.cod_producto}`}
              className="tt-related-card"
            >
              <div className="tt-related-card__img-box">
                <img
                  src={imgUrl}
                  alt={item.nombre}
                  className="tt-related-card__img"
                  loading="lazy"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = placeholderUrl;
                  }}
                />
              </div>
              <div className="tt-related-card__info">
                <span className="tt-related-card__type">{item.tipo || 'Complemento'}</span>
                <h4 className="tt-related-card__name">{item.nombre}</h4>
                <div className="tt-related-card__price">{item.precio_desde}</div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};
