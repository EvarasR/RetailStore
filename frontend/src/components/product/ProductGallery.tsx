import React, { useState } from 'react';
import { ZoomIn, X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { ProductImage } from '../../api/products.api';
import placeholderUrl from '../../assets/placeholder-product.svg';

export interface ProductGalleryProps {
  imagenes?: ProductImage[];
  nombre: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({ imagenes = [], nombre }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError, setImageError] = useState<Record<number, boolean>>({});

  const items = imagenes.length > 0 ? imagenes : [{ url: '', alt: nombre, principal: true, orden: 0 }];
  const currentItem = items[selectedIndex] || items[0];
  const currentUrl = currentItem.url && !imageError[selectedIndex] ? currentItem.url : placeholderUrl;

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev > 0 ? prev - 1 : items.length - 1));
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIndex((prev) => (prev < items.length - 1 ? prev + 1 : 0));
  };

  const handleImageError = (index: number) => {
    setImageError((prev) => ({ ...prev, [index]: true }));
  };

  return (
    <div className="tt-product-gallery">
      {/* Miniaturas en columna izquierda (Desktop) / Abajo (Móvil) */}
      {items.length > 1 && (
        <div className="tt-product-gallery__thumbnails" role="tablist" aria-label="Miniaturas del producto">
          {items.map((img, idx) => {
            const thumbUrl = img.url && !imageError[idx] ? img.url : placeholderUrl;
            const isSelected = idx === selectedIndex;
            return (
              <button
                key={idx}
                type="button"
                role="tab"
                aria-selected={isSelected}
                className={`tt-product-gallery__thumb ${isSelected ? 'tt-product-gallery__thumb--active' : ''}`}
                onClick={() => setSelectedIndex(idx)}
                aria-label={`Ver imagen ${idx + 1} de ${items.length}`}
              >
                <img
                  src={thumbUrl}
                  alt={img.alt || `${nombre} miniatura ${idx + 1}`}
                  onError={() => handleImageError(idx)}
                  loading="lazy"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Imagen Principal */}
      <div
        className="tt-product-gallery__main"
        onClick={() => setIsModalOpen(true)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsModalOpen(true);
          }
        }}
        aria-label="Ampliar imagen del producto"
        title="Haz clic para ampliar"
      >
        <img
          src={currentUrl}
          alt={currentItem.alt || nombre}
          className="tt-product-gallery__main-img"
          onError={() => handleImageError(selectedIndex)}
        />
        <button type="button" className="tt-product-gallery__zoom-btn" aria-label="Ampliar vista">
          <ZoomIn size={18} />
        </button>

        {items.length > 1 && (
          <>
            <button type="button" className="tt-product-gallery__nav-btn tt-product-gallery__nav-btn--left" onClick={handlePrev} aria-label="Imagen anterior">
              <ChevronLeft size={20} />
            </button>
            <button type="button" className="tt-product-gallery__nav-btn tt-product-gallery__nav-btn--right" onClick={handleNext} aria-label="Imagen siguiente">
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {/* Modal Zoom Ligero */}
      {isModalOpen && (
        <div
          className="tt-product-gallery__modal-backdrop"
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Vista ampliada del producto"
        >
          <div className="tt-product-gallery__modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="tt-product-gallery__modal-close"
              onClick={() => setIsModalOpen(false)}
              aria-label="Cerrar vista ampliada"
            >
              <X size={24} />
            </button>
            <img
              src={currentUrl}
              alt={currentItem.alt || nombre}
              className="tt-product-gallery__modal-img"
            />
            {items.length > 1 && (
              <div className="tt-product-gallery__modal-nav">
                <button type="button" className="tt-product-gallery__nav-btn" onClick={handlePrev} aria-label="Anterior">
                  <ChevronLeft size={24} />
                </button>
                <span className="tt-product-gallery__modal-counter">
                  {selectedIndex + 1} / {items.length}
                </span>
                <button type="button" className="tt-product-gallery__nav-btn" onClick={handleNext} aria-label="Siguiente">
                  <ChevronRight size={24} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
