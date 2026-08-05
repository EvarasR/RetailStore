import React from 'react';
import { Star, StarHalf } from 'lucide-react';

export interface RatingProps {
  value: number; // e.g. 4.5
  count?: number; // e.g. 24
  size?: number;
  showText?: boolean;
  onCountClick?: () => void;
}

export const Rating: React.FC<RatingProps> = ({
  value,
  count,
  size = 16,
  showText = true,
  onCountClick,
}) => {
  const rounded = Math.round(value * 2) / 2; // to 0.5 step
  const stars = [];

  for (let i = 1; i <= 5; i++) {
    if (i <= rounded) {
      stars.push(<Star key={i} size={size} className="tt-rating-star tt-rating-star--full" fill="currentColor" />);
    } else if (i - 0.5 === rounded) {
      stars.push(<StarHalf key={i} size={size} className="tt-rating-star tt-rating-star--half" fill="currentColor" />);
    } else {
      stars.push(<Star key={i} size={size} className="tt-rating-star tt-rating-star--empty" />);
    }
  }

  return (
    <div className="tt-rating">
      <div className="tt-rating__stars" aria-label={`Calificación ${value.toFixed(1)} de 5 estrellas`}>
        {stars}
      </div>
      {showText && (
        <span className="tt-rating__value">{value.toFixed(1)}</span>
      )}
      {typeof count === 'number' && (
        <button
          type="button"
          className="tt-rating__count"
          onClick={onCountClick}
          disabled={!onCountClick}
          title={onCountClick ? 'Ver todas las reseñas' : undefined}
        >
          ({count} {count === 1 ? 'reseña' : 'reseñas'})
        </button>
      )}
    </div>
  );
};
