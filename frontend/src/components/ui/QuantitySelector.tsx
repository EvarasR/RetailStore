import React from 'react';
import { Minus, Plus } from 'lucide-react';

export interface QuantitySelectorProps {
  value: number;
  onChange: (newValue: number) => void;
  min?: number;
  max?: number;
  disabled?: boolean;
}

/**
 * Selector de cantidad visual.
 * Respeta regla DB-First: no valida reglas de stock avanzadas de negocio,
 * solo aplica límites opcionales si el backend los provee en UI básica.
 */
export const QuantitySelector: React.FC<QuantitySelectorProps> = ({
  value,
  onChange,
  min = 1,
  max = 99,
  disabled = false,
}) => {
  const handleDecrement = () => {
    if (disabled || value <= min) return;
    onChange(value - 1);
  };

  const handleIncrement = () => {
    if (disabled || value >= max) return;
    onChange(value + 1);
  };

  return (
    <div className="tt-quantity-selector">
      <button
        type="button"
        className="tt-quantity-selector__btn"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        aria-label="Disminuir cantidad"
      >
        <Minus size={14} />
      </button>
      <span className="tt-quantity-selector__value" aria-label="Cantidad seleccionada">
        {value}
      </span>
      <button
        type="button"
        className="tt-quantity-selector__btn"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        aria-label="Aumentar cantidad"
      >
        <Plus size={14} />
      </button>
    </div>
  );
};
