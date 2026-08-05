import React, { useState } from 'react';
import { Star, CheckCircle, MessageSquare, Send, AlertCircle, Loader2 } from 'lucide-react';
import { Rating } from '../ui/Rating';
import { postProductReview, type ProductReviewItem } from '../../api/products.api';

export interface ProductReviewsProps {
  codProducto: number;
  resenas: ProductReviewItem[];
  ratingPromedio: number;
  numResenas: number;
  puedeResenar: boolean;
  compraVerificada: boolean;
  resenaUsuario?: ProductReviewItem | null;
  onReviewSubmitted?: () => void;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  codProducto,
  resenas = [],
  ratingPromedio,
  numResenas,
  puedeResenar,
  compraVerificada,
  resenaUsuario,
  onReviewSubmitted,
}) => {
  const [calificacion, setCalificacion] = useState(5);
  const [titulo, setTitulo] = useState('');
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comentario.trim() || comentario.trim().length < 10) {
      setError('El comentario debe tener al menos 10 caracteres.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await postProductReview(codProducto, {
        calificacion,
        titulo: titulo.trim(),
        comentario: comentario.trim(),
      });
      setSuccessMsg(res.mensaje || 'Tu reseña fue enviada para moderación.');
      setTitulo('');
      setComentario('');
      setShowForm(false);
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }
    } catch (err: any) {
      setError(err?.message || 'No se pudo enviar la reseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="tt-product-reviews" aria-labelledby="reviews-heading">
      <div className="tt-product-reviews__summary">
        <div className="tt-product-reviews__score-box">
          <span className="tt-product-reviews__big-score">{ratingPromedio.toFixed(1)}</span>
          <Rating value={ratingPromedio} showText={false} size={20} />
          <span className="tt-product-reviews__count-label">
            Basado en {numResenas} {numResenas === 1 ? 'valoración' : 'valoraciones'}
          </span>
        </div>

        <div className="tt-product-reviews__action-box">
          <h4 className="tt-product-reviews__share-title">¿Compraste este equipo en TechTail?</h4>
          <p className="tt-product-reviews__share-desc">
            Comparte tu experiencia técnica con otros ingenieros y compradores de infraestructura.
          </p>

          {compraVerificada && !resenaUsuario && puedeResenar && (
            <button
              type="button"
              className="tt-btn tt-btn--outline tt-product-reviews__btn-open"
              onClick={() => setShowForm(!showForm)}
            >
              <MessageSquare size={16} />
              <span>{showForm ? 'Cancelar reseña' : 'Escribir una reseña técnica'}</span>
            </button>
          )}

          {resenaUsuario && (
            <div className="tt-product-reviews__user-review-notice">
              <CheckCircle size={16} className="tt-product-reviews__success-icon" />
              <span>Ya has enviado tu valoración para este producto.</span>
            </div>
          )}

          {!compraVerificada && (
            <div className="tt-product-reviews__login-notice">
              Para reseñar un producto, debes ser un usuario autenticado con una compra verificada en estado entregado.
            </div>
          )}
        </div>
      </div>

      {/* Formulario de Reseña */}
      {showForm && (
        <form className="tt-product-reviews__form" onSubmit={handleSubmit} noValidate>
          <h4 className="tt-product-reviews__form-title">Escribe tu reseña corporativa</h4>

          {error && (
            <div className="tt-alert tt-alert--error" role="alert">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="tt-alert tt-alert--success" role="alert">
              <CheckCircle size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <div className="tt-product-reviews__field">
            <label htmlFor="review-calificacion">Valoración general:</label>
            <div className="tt-product-reviews__star-picker">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`tt-product-reviews__star-btn ${s <= calificacion ? 'tt-product-reviews__star-btn--active' : ''}`}
                  onClick={() => setCalificacion(s)}
                  aria-label={`${s} estrellas`}
                >
                  <Star size={22} fill={s <= calificacion ? 'currentColor' : 'none'} />
                </button>
              ))}
              <span className="tt-product-reviews__star-val">{calificacion} de 5 estrellas</span>
            </div>
          </div>

          <div className="tt-product-reviews__field">
            <label htmlFor="review-titulo">Título de la reseña (opcional):</label>
            <input
              id="review-titulo"
              type="text"
              className="tt-input"
              placeholder="Ej: Excelente rendimiento en base de datos PostgreSQL"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              maxLength={160}
            />
          </div>

          <div className="tt-product-reviews__field">
            <label htmlFor="review-comentario">Comentario detallado (mín. 10 caracteres):</label>
            <textarea
              id="review-comentario"
              className="tt-textarea"
              rows={4}
              placeholder="Explica qué te gustó o qué se puede mejorar en rendimiento, estabilidad y soporte..."
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              maxLength={2000}
              required
            />
          </div>

          <div className="tt-product-reviews__form-actions">
            <button
              type="submit"
              className="tt-btn tt-btn--primary"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="tt-spin" />
                  <span>Enviando...</span>
                </>
              ) : (
                <>
                  <Send size={16} />
                  <span>Enviar reseña para revisión</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Lista de Reseñas */}
      <div className="tt-product-reviews__list">
        <h4 className="tt-product-reviews__list-title">
          Valoraciones más recientes de clientes empresariales
        </h4>

        {resenas.length === 0 ? (
          <div className="tt-product-reviews__empty">
            <MessageSquare size={32} className="tt-product-reviews__empty-icon" />
            <h5>Aún no hay reseñas públicas para este equipo</h5>
            <p>
              Sé el primero en compartir tu experiencia con esta tecnología en tu infraestructura corporativa.
            </p>
          </div>
        ) : (
          <ul className="tt-product-reviews__items">
            {resenas.map((rev, idx) => (
              <li key={idx} className="tt-product-reviews__item">
                <div className="tt-product-reviews__item-header">
                  <Rating value={rev.calificacion} showText={false} size={14} />
                  {rev.titulo && <strong className="tt-product-reviews__item-title">{rev.titulo}</strong>}
                </div>
                <div className="tt-product-reviews__item-meta">
                  <span className="tt-product-reviews__verified-tag">
                    <CheckCircle size={12} /> Compra Verificada
                  </span>
                  {rev.fecha && <time className="tt-product-reviews__date">{rev.fecha}</time>}
                </div>
                <p className="tt-product-reviews__item-body">{rev.comentario}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
