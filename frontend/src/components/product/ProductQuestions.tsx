import React, { useState } from 'react';
import { HelpCircle, Send, Loader2, AlertCircle, CheckCircle2, MessageCircle } from 'lucide-react';
import { postProductQuestion, type ProductQuestionItem } from '../../api/products.api';

export interface ProductQuestionsProps {
  codProducto: number;
  preguntas: ProductQuestionItem[];
  loading?: boolean;
  onQuestionSubmitted?: () => void;
}

export const ProductQuestions: React.FC<ProductQuestionsProps> = ({
  codProducto,
  preguntas = [],
  loading = false,
  onQuestionSubmitted,
}) => {
  const [questionText, setQuestionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim() || questionText.trim().length < 5) {
      setError('Escribe una pregunta más clara (mínimo 5 caracteres).');
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await postProductQuestion(codProducto, questionText.trim());
      setSuccess(res.mensaje || 'Pregunta enviada y registrada con éxito.');
      setQuestionText('');
      if (onQuestionSubmitted) {
        onQuestionSubmitted();
      }
    } catch (err: any) {
      setError(err?.message || 'Error al enviar la pregunta al servidor.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="tt-product-questions" aria-labelledby="questions-heading">
      <div className="tt-product-questions__header">
        <HelpCircle size={22} className="tt-product-questions__icon" />
        <div>
          <h3 id="questions-heading" className="tt-product-questions__title">
            Preguntas y Respuestas Técnicas
          </h3>
          <p className="tt-product-questions__subtitle">
            ¿Tienes dudas sobre compatibilidad, rack, RAID o despacho? Pregunta directamente a nuestros especialistas.
          </p>
        </div>
      </div>

      {/* Formulario de Pregunta */}
      <form className="tt-product-questions__form" onSubmit={handleSubmit} noValidate>
        {error && (
          <div className="tt-alert tt-alert--error">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}
        {success && (
          <div className="tt-alert tt-alert--success">
            <CheckCircle2 size={16} />
            <span>{success}</span>
          </div>
        )}

        <div className="tt-product-questions__input-group">
          <input
            type="text"
            className="tt-input tt-product-questions__input"
            placeholder="Ej: ¿Este modelo incluye rieles de montaje rack para gabinete estándar de 800mm?"
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            disabled={submitting}
            maxLength={300}
          />
          <button
            type="submit"
            className="tt-btn tt-btn--primary tt-product-questions__submit"
            disabled={submitting || !questionText.trim()}
          >
            {submitting ? (
              <Loader2 size={18} className="tt-spin" />
            ) : (
              <>
                <Send size={16} />
                <span>Preguntar</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Lista de Preguntas */}
      <div className="tt-product-questions__list">
        {loading ? (
          <div className="tt-product-questions__loading">
            <Loader2 size={24} className="tt-spin" />
            <span>Cargando consultas...</span>
          </div>
        ) : preguntas.length === 0 ? (
          <div className="tt-product-questions__empty">
            <MessageCircle size={32} className="tt-product-questions__empty-icon" />
            <h5>Aún no hay preguntas para este producto</h5>
            <p>Se el primero en plantear una consulta técnica y recibirás respuesta de nuestro equipo de ingeniería.</p>
          </div>
        ) : (
          <ul className="tt-product-questions__items">
            {preguntas.map((item, idx) => (
              <li key={idx} className="tt-product-questions__item">
                <div className="tt-product-questions__question">
                  <span className="tt-product-questions__q-tag">P</span>
                  <div className="tt-product-questions__q-body">
                    <strong>{item.pregunta}</strong>
                    {item.fecha && <time>{item.fecha}</time>}
                  </div>
                </div>

                {item.respuesta ? (
                  <div className="tt-product-questions__answer">
                    <span className="tt-product-questions__a-tag">R</span>
                    <div className="tt-product-questions__a-body">
                      <p>{item.respuesta}</p>
                      <span className="tt-product-questions__a-author">
                        Respuesta oficial de Ingeniería TechTail
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="tt-product-questions__pending">
                    <span>Consulta en proceso de revisión técnica por nuestros ingenieros</span>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};
