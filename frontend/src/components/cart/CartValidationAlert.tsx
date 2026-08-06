import React from 'react';
import { Alert } from '../ui/Alert';
import type { CartValidationResult } from '../../types/cart.types';

interface CartValidationAlertProps {
  result: CartValidationResult | null;
}

export const CartValidationAlert: React.FC<CartValidationAlertProps> = ({ result }) => {
  if (!result || !result.resultado) return null;

  const { valido, mensajes } = result.resultado;
  if (valido && (!mensajes || mensajes.length === 0)) return null;

  const variant = valido ? 'info' : 'warning';
  const title = valido
    ? 'Validación del Carrito Exitoso'
    : 'Aviso de Validación del Carrito en PostgreSQL';

  return (
    <Alert variant={variant} title={title} className="mb-4">
      {mensajes && mensajes.length > 0 ? (
        <ul style={{ margin: 0, paddingLeft: '1.25rem' }}>
          {mensajes.map((msg, idx) => (
            <li key={idx}>{msg}</li>
          ))}
        </ul>
      ) : (
        <span>El carrito ha sido verificado con las políticas de inventario de TechTail.</span>
      )}
    </Alert>
  );
};
