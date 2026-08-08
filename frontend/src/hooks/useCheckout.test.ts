import { act, renderHook, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { HttpError } from '../api/http';
import { createOrder } from '../api/checkout.api';
import { fetchOrderDetail } from '../api/orders.api';
import { fetchShippingMethods } from '../api/shipping.api';
import { useAuth } from './useAuth';
import { usePaymentMethods } from './usePaymentMethods';
import { useCheckout } from './useCheckout';

vi.mock('../api/checkout.api', () => ({ createOrder: vi.fn() }));
vi.mock('../api/orders.api', () => ({ fetchOrderDetail: vi.fn() }));
vi.mock('../api/shipping.api', () => ({ fetchShippingMethods: vi.fn() }));
vi.mock('./useAuth', () => ({ useAuth: vi.fn() }));
vi.mock('./usePaymentMethods', () => ({ usePaymentMethods: vi.fn() }));

const mockedCreateOrder = vi.mocked(createOrder);
const mockedFetchOrderDetail = vi.mocked(fetchOrderDetail);
const mockedFetchShippingMethods = vi.mocked(fetchShippingMethods);
const mockedUseAuth = vi.mocked(useAuth);
const mockedUsePaymentMethods = vi.mocked(usePaymentMethods);

describe('useCheckout', () => {
  const authorizePayment = vi.fn();
  const capturePayment = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    sessionStorage.clear();
    mockedUseAuth.mockReturnValue({
      autenticado: true,
      loading: false,
      usuario: { cod_usuario: 41 },
    } as ReturnType<typeof useAuth>);
    mockedUsePaymentMethods.mockReturnValue({
      authorizePayment,
      capturePayment,
    } as unknown as ReturnType<typeof usePaymentMethods>);
    mockedFetchShippingMethods.mockResolvedValue([]);
  });

  it('bloquea una segunda creación mientras la primera solicitud sigue activa', async () => {
    let resolveOrder!: (value: Awaited<ReturnType<typeof createOrder>>) => void;
    mockedCreateOrder.mockReturnValue(new Promise((resolve) => { resolveOrder = resolve; }));

    const { result } = renderHook(() => useCheckout());
    act(() => result.current.setSelectedAddressId(9));

    let firstRequest!: Promise<boolean>;
    let duplicateRequest!: Promise<boolean>;
    act(() => {
      firstRequest = result.current.handleCreateOrder();
      duplicateRequest = result.current.handleCreateOrder();
    });

    await expect(duplicateRequest).resolves.toBe(false);
    expect(mockedCreateOrder).toHaveBeenCalledTimes(1);

    resolveOrder({ ok: true, mensaje: 'Creado', cod_pedido: 88, total: '120.50' });
    await expect(firstRequest).resolves.toBe(true);
    expect(sessionStorage.getItem('tt_checkout_cod_pedido')).toBe('88');
  });

  it('recupera exclusivamente el pedido persistido y conserva valores oficiales', async () => {
    sessionStorage.setItem('tt_checkout_cod_usuario', '41');
    sessionStorage.setItem('tt_checkout_cod_pedido', '501');
    mockedFetchOrderDetail.mockResolvedValue({
      ok: true,
      pedido: {
        cod_pedido: 501,
        numero_pedido: 'TT-501',
        estado: 'PENDIENTE_PAGO',
        subtotal: '90.00',
        descuento: '5.00',
        impuesto: '10.20',
        costo_envio: '4.00',
        total: '99.20',
      },
      items: [],
    });

    const { result } = renderHook(() => useCheckout());

    await waitFor(() => expect(result.current.step).toBe('READY_TO_PAY'));
    expect(mockedFetchOrderDetail).toHaveBeenCalledWith('501');
    expect(result.current.createdOrder).toMatchObject({
      cod_pedido: 501,
      subtotal: '90.00',
      impuesto: '10.20',
      total: '99.20',
    });
  });

  it('clasifica el rechazo por estado HTTP y permite un nuevo intento idempotente', async () => {
    authorizePayment.mockRejectedValue(new HttpError('Pago rechazado.', 402, { ok: false }));
    const { result } = renderHook(() => useCheckout());

    act(() => {
      result.current.setCreatedOrder({ ok: true, mensaje: 'Creado', cod_pedido: 77 });
      result.current.setSelectedPaymentId(6);
    });

    await act(async () => {
      await expect(result.current.handlePay()).resolves.toBe(false);
    });

    expect(result.current.step).toBe('PAYMENT_DECLINED');
    expect(capturePayment).not.toHaveBeenCalled();
    expect(sessionStorage.getItem('tt_checkout_payment_attempt_id')).toBeNull();
  });
});
