import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchCart, updateCartQuantity, validateCart } from '../api/cart.api';
import { useAuth } from './useAuth';
import { useCart } from './useCart';

vi.mock('../api/cart.api', () => ({
  addToCart: vi.fn(),
  fetchCart: vi.fn(),
  removeFromCart: vi.fn(),
  updateCartQuantity: vi.fn(),
  validateCart: vi.fn(),
}));
vi.mock('./useAuth', () => ({ useAuth: vi.fn() }));

const mockedFetchCart = vi.mocked(fetchCart);
const mockedUpdateCartQuantity = vi.mocked(updateCartQuantity);
const mockedValidateCart = vi.mocked(validateCart);
const mockedUseAuth = vi.mocked(useAuth);

const officialCart = {
  ok: true,
  cod_carrito: 14,
  total: '53.42',
  cantidad_items: 1,
  items: [{
    cod_producto: 8,
    nombre: 'Switch administrable',
    marca: 'TechTail',
    imagen: '',
    cantidad: 2,
    precio_unitario: '24.50',
    subtotal: '49.00',
  }],
  desglose: {
    subtotal_carrito: '49.00',
    descuento: '0.00',
    impuesto: '4.42',
    costo_envio: null,
    total_estimado: '53.42',
  },
};

describe('useCart', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseAuth.mockReturnValue({ autenticado: true, loading: false } as ReturnType<typeof useAuth>);
    mockedFetchCart.mockResolvedValue(officialCart);
  });

  it('presenta el desglose recibido sin recalcular importes', async () => {
    const { result } = renderHook(() => useCart());
    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.cart?.items[0].subtotal).toBe('49.00');
    expect(result.current.cart?.desglose?.total_estimado).toBe('53.42');
    expect(result.current.cart?.total).toBe('53.42');
  });

  it('vuelve a consultar PostgreSQL después de actualizar una cantidad', async () => {
    mockedUpdateCartQuantity.mockResolvedValue({ ok: true, mensaje: 'Actualizado' });
    const { result } = renderHook(() => useCart());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => result.current.updateQuantity(8, 3));

    expect(mockedUpdateCartQuantity).toHaveBeenCalledWith(8, 3);
    expect(mockedFetchCart).toHaveBeenCalledTimes(2);
  });

  it('conserva los mensajes oficiales al validar el carrito', async () => {
    mockedValidateCart.mockResolvedValue({
      ok: false,
      resultado: { valido: false, mensajes: ['Cantidad máxima excedida.'] },
    });
    const { result } = renderHook(() => useCart());
    await waitFor(() => expect(result.current.loading).toBe(false));

    await act(async () => {
      await result.current.validate();
    });

    expect(result.current.validationResult?.resultado?.mensajes).toEqual(['Cantidad máxima excedida.']);
  });
});
