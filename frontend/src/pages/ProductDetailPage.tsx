import React, { useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import { useProductDetail, useProductQuestions } from '../hooks/useProducts';
import { Breadcrumb } from '../components/ui/Breadcrumb';
import { Toast, type ToastType } from '../components/ui/Toast';
import { ProductGallery } from '../components/product/ProductGallery';
import { ProductInfo } from '../components/product/ProductInfo';
import { ProductBuyBox } from '../components/product/ProductBuyBox';
import { ProductSpecs } from '../components/product/ProductSpecs';
import { ProductReviews } from '../components/product/ProductReviews';
import { ProductQuestions } from '../components/product/ProductQuestions';
import { RelatedProducts } from '../components/product/RelatedProducts';
import { addToCart } from '../api/cart.api';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { product, loading, error, refetch } = useProductDetail(id);
  const { questions, loading: loadingQuestions, refetch: refetchQuestions } = useProductQuestions(id);

  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const [mobileAdding, setMobileAdding] = useState(false);

  const reviewsRef = useRef<HTMLDivElement>(null);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ message, type });
  };

  const scrollToReviews = () => {
    reviewsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleMobileAddToCart = async () => {
    if (!product) return;
    if (product.requiere_login) {
      window.location.href = `/login?next=/producto/${product.cod_producto}`;
      return;
    }
    setMobileAdding(true);
    try {
      const res = await addToCart(product.cod_producto, 1);
      showToast(res.mensaje || 'Producto agregado al carrito.', 'success');
    } catch (err: any) {
      showToast(err?.message || 'No se pudo agregar al carrito.', 'error');
    } finally {
      setMobileAdding(false);
    }
  };

  // 1. Estado de Carga (Skeleton profesional)
  if (loading) {
    return (
      <div className="tt-container tt-product-detail-page">
        <div className="tt-product-skeleton">
          <div className="tt-skeleton tt-skeleton--text" style={{ width: '30%', height: '1.25rem', marginBottom: '2rem' }} />
          <div className="tt-product-skeleton__grid">
            <div className="tt-skeleton" style={{ height: '420px', borderRadius: '0.75rem' }} />
            <div>
              <div className="tt-skeleton tt-skeleton--text" style={{ width: '40%', height: '1rem', marginBottom: '0.75rem' }} />
              <div className="tt-skeleton tt-skeleton--text" style={{ width: '90%', height: '2.5rem', marginBottom: '1.25rem' }} />
              <div className="tt-skeleton tt-skeleton--text" style={{ width: '25%', height: '1.5rem', marginBottom: '1.5rem' }} />
              <div className="tt-skeleton" style={{ height: '180px', borderRadius: '0.5rem' }} />
            </div>
            <div className="tt-skeleton" style={{ height: '380px', borderRadius: '0.75rem' }} />
          </div>
        </div>
      </div>
    );
  }

  // 2. Estado de Error o Producto no encontrado (404)
  if (error || !product) {
    return (
      <div className="tt-container tt-product-detail-page">
        <div className="tt-product-error">
          <AlertCircle size={48} className="tt-product-error__icon" />
          <h2 className="tt-product-error__title">Producto no disponible en el catálogo</h2>
          <p className="tt-product-error__desc">
            {error || 'El producto que buscas pudo ser retirado, descontinuado o su código no es válido.'}
          </p>
          <div className="tt-product-error__actions">
            <Link to="/catalogo" className="tt-btn tt-btn--primary">
              <ArrowLeft size={16} />
              <span>Explorar catálogo TechTail</span>
            </Link>
            <button type="button" onClick={refetch} className="tt-btn tt-btn--outline">
              Reintentar carga
            </button>
          </div>
        </div>
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Catálogo', href: '/catalogo' },
    ...(product.categoria
      ? [{ label: product.categoria, href: `/catalogo?categoria=${encodeURIComponent(product.categoria)}` }]
      : []),
    { label: product.nombre },
  ];

  return (
    <div className="tt-product-detail-page">
      {/* Notificaciones flotantes Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      <div className="tt-container">
        {/* Breadcrumb superior */}
        <Breadcrumb items={breadcrumbItems} className="tt-product-detail__breadcrumb" />

        {/* Bloque Principal del Producto (3 Columnas Amazon-style en Desktop) */}
        <div className="tt-product-main-grid">
          {/* Columna 1: Galería de Imágenes */}
          <div className="tt-product-main-grid__gallery">
            <ProductGallery
              imagenes={product.imagenes}
              nombre={product.nombre}
            />
          </div>

          {/* Columna 2: Información Central */}
          <div className="tt-product-main-grid__info">
            <ProductInfo
              product={product}
              onReviewsClick={scrollToReviews}
            />
          </div>

          {/* Columna 3: Buy Box Lateral */}
          <div className="tt-product-main-grid__buybox">
            <ProductBuyBox
              product={product}
              onCartAdded={(msg) => showToast(msg, 'success')}
              onCartError={(msg) => showToast(msg, 'error')}
              onWishlistToggled={(_fav, msg) => showToast(msg, 'info')}
            />
          </div>
        </div>

        {/* Secciones inferiores del producto */}
        <div className="tt-product-sections">
          {/* Especificaciones Técnicas */}
          <ProductSpecs product={product} />

          {/* Sección de Reseñas */}
          <div ref={reviewsRef}>
            <ProductReviews
              codProducto={product.cod_producto}
              resenas={product.resenas || []}
              ratingPromedio={product.rating || 4.8}
              numResenas={product.num_resenas || 0}
              puedeResenar={product.puede_resenar}
              compraVerificada={product.compra_verificada}
              resenaUsuario={product.resena_usuario}
              onReviewSubmitted={() => {
                showToast('Reseña recibida. Se publicará tras revisión.', 'success');
                refetch();
              }}
            />
          </div>

          {/* Sección de Preguntas y Respuestas */}
          <ProductQuestions
            codProducto={product.cod_producto}
            preguntas={questions}
            loading={loadingQuestions}
            onQuestionSubmitted={() => {
              showToast('Consulta enviada exitosamente.', 'success');
              refetchQuestions();
            }}
          />

          {/* Productos Relacionados */}
          <RelatedProducts relacionados={product.relacionados || []} />
        </div>
      </div>

      {/* Sticky Buy Bar en Móvil (<768px) */}
      <div className="tt-mobile-sticky-bar" role="region" aria-label="Acceso rápido de compra móvil">
        <div className="tt-mobile-sticky-bar__price-col">
          <span className="tt-mobile-sticky-bar__label">Total:</span>
          <strong className="tt-mobile-sticky-bar__price">
            {product.precio_final || product.precio_actual}
          </strong>
        </div>
        <button
          type="button"
          className="tt-btn tt-btn--primary tt-mobile-sticky-bar__btn"
          onClick={handleMobileAddToCart}
          disabled={!product.puede_comprar || mobileAdding}
        >
          {mobileAdding ? (
            <>
              <Loader2 size={16} className="tt-spin" />
              <span>Agregando...</span>
            </>
          ) : (
            <>
              <ShoppingCart size={16} />
              <span>Agregar al carrito</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
