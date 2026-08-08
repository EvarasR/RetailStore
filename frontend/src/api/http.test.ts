import { describe, expect, it } from 'vitest';
import { HttpError, isProtectedApiUrl, safeErrorMessage } from './http';

describe('contrato de errores HTTP', () => {
  it('distingue endpoints protegidos de login y catálogo público', () => {
    expect(isProtectedApiUrl('/panel/api/productos/')).toBe(true);
    expect(isProtectedApiUrl('/operaciones/api/facturas/')).toBe(true);
    expect(isProtectedApiUrl('/api/auth/login/')).toBe(false);
    expect(isProtectedApiUrl('/api/productos/')).toBe(false);
  });

  it('preserva mensajes de validación y oculta detalles internos', () => {
    expect(safeErrorMessage(400, { mensaje: 'Cantidad inválida.' })).toBe('Cantidad inválida.');
    expect(safeErrorMessage(500, { mensaje: 'psycopg SQL traceback' })).toBe('El servidor no pudo completar la operación. Inténtalo nuevamente.');
  });

  it('expone estado estructurado sin inferirlo desde el texto', () => {
    const error = new HttpError('El pago fue rechazado.', 402, { ok: false });
    expect(error.status).toBe(402);
    expect(error.payload).toEqual({ ok: false });
  });
});
