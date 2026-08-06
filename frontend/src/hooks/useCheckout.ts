import { useState, useEffect, useCallback } from 'react';
import { fetchShippingMethods } from '../api/shipping.api';
import { createOrder } from '../api/checkout.api';
import type { ShippingMethod, CreateOrderResult } from '../types/checkout.types';
import { useAuth } from './useAuth';
import { usePaymentMethods } from './usePaymentMethods';

export type CheckoutStep = 1 | 2 | 3 | 4 | 5 | 6;

export function useCheckout() {
  const { autenticado: isAuthenticated } = useAuth();
  const { authorizePayment, capturePayment } = usePaymentMethods();

  const [step, setStep] = useState<CheckoutStep>(1);
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [loadingShipping, setLoadingShipping] = useState<boolean>(false);

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);

  const [createdOrder, setCreatedOrder] = useState<CreateOrderResult | null>(null);
  const [confirmedPayment, setConfirmedPayment] = useState<unknown | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  const loadShippingMethods = useCallback(async () => {
    try {
      setLoadingShipping(true);
      const data = await fetchShippingMethods();
      setShippingMethods(data);
      if (data.length > 0 && !selectedShippingId) {
        setSelectedShippingId(data[0].cod_metodo_envio);
      }
    } catch (err: unknown) {
      console.error('Error cargando métodos de envío:', err);
    } finally {
      setLoadingShipping(false);
    }
  }, [selectedShippingId]);

  useEffect(() => {
    if (isAuthenticated) {
      loadShippingMethods();
    }
  }, [isAuthenticated, loadShippingMethods]);

  const handleCreateOrderAndPay = async (): Promise<boolean> => {
    if (!selectedAddressId) {
      setError('Por favor selecciona una dirección de envío.');
      return false;
    }
    if (!selectedPaymentId) {
      setError('Por favor selecciona un método de pago.');
      return false;
    }

    try {
      setProcessing(true);
      setError(null);

      // 1. Crear el pedido oficial en Django PostgreSQL (DB-First)
      const orderRes = await createOrder(selectedAddressId, selectedShippingId || undefined);
      if (!orderRes.ok || !orderRes.cod_pedido) {
        throw new Error(orderRes.mensaje || 'No se pudo crear el pedido.');
      }
      setCreatedOrder(orderRes);

      // 2. Autorizar pago simulado en la pasarela corporativa
      const idempotency_key = `tt_order_${orderRes.cod_pedido}_${Date.now()}`;
      const authRes = await authorizePayment({
        cod_pedido: orderRes.cod_pedido,
        cod_metodo_pago: selectedPaymentId,
        idempotency_key,
      });

      if (!authRes.ok || !authRes.cod_transaccion) {
        throw new Error(authRes.mensaje || 'El pago no fue autorizado por la pasarela.');
      }

      // 3. Capturar pago formal en PostgreSQL para confirmar pedido
      const capRes = await capturePayment(authRes.cod_transaccion);
      if (!capRes.ok) {
        throw new Error(capRes.mensaje || 'Error al capturar el pago.');
      }

      setConfirmedPayment(capRes);
      setStep(6);
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error en el procesamiento del pedido';
      setError(msg);
      return false;
    } finally {
      setProcessing(false);
    }
  };

  return {
    step,
    setStep,
    shippingMethods,
    loadingShipping,
    selectedAddressId,
    setSelectedAddressId,
    selectedShippingId,
    setSelectedShippingId,
    selectedPaymentId,
    setSelectedPaymentId,
    createdOrder,
    confirmedPayment,
    error,
    setError,
    processing,
    submitCheckout: handleCreateOrderAndPay,
  };
}
