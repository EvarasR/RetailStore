import { describe, expect, it } from 'vitest';
import { normalizeProduct } from './products.api';

describe('normalizeProduct', () => {
  it('conserva el precio y descuento oficiales sin recalcularlos', () => {
    const product = normalizeProduct({
      cod_producto: 7, nombre: 'Router', precio_actual: '$100.00', precio_normal: '$100.00',
      precio_final: '$83.37', tiene_descuento: true, descuento_monto: '$16.63',
      descuento_porcentaje: '16.63', promocion: { nombre: 'Semana de redes' },
    });
    expect(product.precio_final).toBe('$83.37');
    expect(product.descuento_porcentaje).toBe('16.63');
    expect(product.promocion?.nombre).toBe('Semana de redes');
  });
});
