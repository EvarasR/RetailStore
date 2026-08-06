import React from 'react';
import { Server, Layers } from 'lucide-react';
import type { ProductDetail } from '../../api/products.api';

export interface ProductSpecsProps {
  product: ProductDetail;
}

export const ProductSpecs: React.FC<ProductSpecsProps> = ({ product }) => {
  const dynamicAttrs = product.atributos || [];
  const hasDimensions = Boolean(product.peso_kg || product.largo_cm || product.ancho_cm || product.alto_cm);

  return (
    <div className="tt-product-specs">
      <div className="tt-product-specs__header">
        <Server size={22} className="tt-product-specs__icon" />
        <h3 className="tt-product-specs__title">Especificaciones Técnicas Detalladas</h3>
      </div>

      <div className="tt-product-specs__table-wrapper">
        <table className="tt-product-specs__table">
          <tbody>
            <tr>
              <th scope="row">Marca del fabricante</th>
              <td>{product.marca || 'TechTail'}</td>
            </tr>
            <tr>
              <th scope="row">Categoría</th>
              <td>{product.categoria || 'Hardware'}</td>
            </tr>
            {product.sku && (
              <tr>
                <th scope="row">SKU / Número de Parte</th>
                <td><code>{product.sku}</code></td>
              </tr>
            )}

            {/* Atributos dinámicos del backend */}
            {dynamicAttrs.map((attr, idx) => (
              <tr key={idx}>
                <th scope="row">{attr.nombre}</th>
                <td>{attr.valor}</td>
              </tr>
            ))}

            {/* Dimensiones y peso si el backend los entrega */}
            {product.peso_kg && (
              <tr>
                <th scope="row">Peso registrado</th>
                <td>{product.peso_kg} kg</td>
              </tr>
            )}
            {hasDimensions && (
              <tr>
                <th scope="row">Dimensiones físicas (L x A x H)</th>
                <td>
                  {[
                    product.largo_cm ? `${product.largo_cm} cm (L)` : null,
                    product.ancho_cm ? `${product.ancho_cm} cm (A)` : null,
                    product.alto_cm ? `${product.alto_cm} cm (H)` : null,
                  ]
                    .filter(Boolean)
                    .join(' × ') || 'No especificado'}
                </td>
              </tr>
            )}
            <tr>
              <th scope="row">Estado en Catálogo</th>
              <td>
                <span className="tt-product-specs__status-pill">
                  {product.estado || 'PUBLICADO'}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {product.ficha_tecnica && (
        <div className="tt-product-specs__datasheet">
          <Layers size={18} />
          <span>Ficha Técnica Oficial del Fabricante disponible para descarga corporativa.</span>
        </div>
      )}
    </div>
  );
};
