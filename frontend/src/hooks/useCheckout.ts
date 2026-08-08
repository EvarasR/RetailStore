import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchShippingMethods } from '../api/shipping.api';
import { createOrder } from '../api/checkout.api';
import { fetchOrderDetail } from '../api/orders.api';
import type { ShippingMethod, CreateOrderResult } from '../types/checkout.types';
import { useAuth } from './useAuth';
import { usePaymentMethods } from './usePaymentMethods';

export type CheckoutStep =
  | 'CART'
  | 'ADDRESS'
  | 'SHIPPING'
  | 'PAYMENT_METHOD'
  | 'REVIEW'
  | 'CREATING_ORDER'
  | 'ORDER_CREATED'
  | 'APPLYING_COUPON'
  | 'READY_TO_PAY'
  | 'AUTHORIZING'
  | 'AUTHORIZED'
  | 'CAPTURING'
  | 'COMPLETED'
  | 'PAYMENT_DECLINED'
  | 'RECOVERY_REQUIRED'
  | 'ERROR';

export function useCheckout() {
  const { autenticado: isAuthenticated, usuario } = useAuth();
  const { authorizePayment, capturePayment } = usePaymentMethods();

  const [step, setStep] = useState<CheckoutStep>('ADDRESS');
  const [shippingMethods, setShippingMethods] = useState<ShippingMethod[]>([]);
  const [loadingShipping, setLoadingShipping] = useState<boolean>(false);

  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [selectedShippingId, setSelectedShippingId] = useState<number | null>(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState<number | null>(null);

  const [createdOrder, setCreatedOrder] = useState<CreateOrderResult | null>(null);
  const [confirmedPayment, setConfirmedPayment] = useState<unknown | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  // Logical lock to prevent double-clicks or re-entrancy
  const submittingRef = useRef(false);

  const clearRecoveryState = useCallback(() => {
    sessionStorage.removeItem('tt_checkout_cod_pedido');
    sessionStorage.removeItem('tt_checkout_payment_attempt_id');
    sessionStorage.removeItem('tt_checkout_cod_usuario');
  }, []);

  // Check identity to prevent restoring a different user's checkout
  useEffect(() => {
    if (isAuthenticated && usuario) {
      const storedUser = sessionStorage.getItem('tt_checkout_cod_usuario');
      if (storedUser && storedUser !== String(usuario.cod_usuario)) {
        clearRecoveryState();
        setStep('ADDRESS');
      } else if (!storedUser) {
        sessionStorage.setItem('tt_checkout_cod_usuario', String(usuario.cod_usuario));
      }
    } else if (!isAuthenticated) {
      clearRecoveryState();
    }
  }, [isAuthenticated, usuario, clearRecoveryState]);

  // Initial recovery attempt
  useEffect(() => {
    const attemptRecovery = async () => {
      const storedOrder = sessionStorage.getItem('tt_checkout_cod_pedido');
      if (!storedOrder) return;

      try {
        setProcessing(true);
        const orderData = await fetchOrderDetail(storedOrder);
        
        if (orderData && orderData.pedido) {
          // Re-hydrate createdOrder
          setCreatedOrder({
            ok: true,
            mensaje: 'Pedido recuperado',
            cod_pedido: orderData.pedido.cod_pedido,
            estado: orderData.pedido.estado,
            subtotal: orderData.pedido.subtotal,
            descuento: orderData.pedido.descuento,
            impuesto: orderData.pedido.impuesto,
            costo_envio: orderData.pedido.costo_envio,
            total: orderData.pedido.total,
          });

          // Move to READY_TO_PAY if it's pending, or COMPLETED if paid
          if (orderData.pedido.estado === 'PENDIENTE_PAGO') {
            setStep('READY_TO_PAY');
          } else if (['PAGADO', 'PREPARANDO', 'ENVIADO', 'ENTREGADO'].includes(orderData.pedido.estado)) {
            setStep('COMPLETED');
            clearRecoveryState();
          } else {
            setStep('ERROR');
            setError('El pedido recuperado no está en un estado válido para el pago.');
          }
        }
      } catch (err) {
        console.error('Failed to recover order state', err);
        clearRecoveryState();
      } finally {
        setProcessing(false);
      }
    };

    if (isAuthenticated) {
      attemptRecovery();
    }
  }, [isAuthenticated, clearRecoveryState]);


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
    if (isAuthenticated && step !== 'READY_TO_PAY' && step !== 'COMPLETED') {
      loadShippingMethods();
    }
  }, [isAuthenticated, loadShippingMethods, step]);

  const handleCreateOrder = async (): Promise<boolean> => {
    if (!selectedAddressId) {
      setError('Por favor selecciona una dirección de envío.');
      return false;
    }
    if (submittingRef.current) return false;
    submittingRef.current = true;

    try {
      setProcessing(true);
      setError(null);
      setStep('CREATING_ORDER');

      const orderRes = await createOrder(selectedAddressId, selectedShippingId || undefined);
      if (!orderRes.ok || !orderRes.cod_pedido) {
        throw new Error(orderRes.mensaje || 'No se pudo crear el pedido.');
      }
      
      setCreatedOrder(orderRes);
      sessionStorage.setItem('tt_checkout_cod_pedido', String(orderRes.cod_pedido));
      setStep('ORDER_CREATED');
      return true;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error en la creación del pedido';
      setError(msg);
      setStep('ERROR');
      return false;
    } finally {
      setProcessing(false);
      submittingRef.current = false;
    }
  };

  const handlePay = async (): Promise<boolean> => {
    if (!createdOrder?.cod_pedido) {
      setError('No hay un pedido creado para pagar.');
      return false;
    }
    if (!selectedPaymentId) {
      setError('Por favor selecciona un método de pago.');
      return false;
    }
    if (submittingRef.current) return false;
    submittingRef.current = true;

    try {
      setProcessing(true);
      setError(null);
      setStep('AUTHORIZING');

      let attemptId = sessionStorage.getItem('tt_checkout_payment_attempt_id');
      if (!attemptId) {
        attemptId = crypto.randomUUID();
        sessionStorage.setItem('tt_checkout_payment_attempt_id', attemptId);
      }

      const authRes = await authorizePayment({
        cod_pedido: createdOrder.cod_pedido,
        cod_metodo_pago: selectedPaymentId,
        idempotency_key: attemptId,
      });

      if (!authRes.ok || !authRes.cod_transaccion) {
        // Rechazo definitivo vs error técnico no es tan trivial de saber solo por la API.
        // Pero el backend devolverá 402 si es declinada (ver capturas en interceptor / throws de postForm).
        // Si llegamos a un error lanzado por fetch, va al catch. Si authRes.ok es falso por otra razón:
        throw new Error(authRes.mensaje || 'El pago no fue autorizado por la pasarela.');
      }

      setStep('CAPTURING');
      
      const capRes = await capturePayment(authRes.cod_transaccion);
      if (!capRes.ok) {
        throw new Error(capRes.mensaje || 'Error al capturar el pago.');
      }

      setConfirmedPayment(capRes);
      setStep('COMPLETED');
      clearRecoveryState();
      return true;
    } catch (err: any) {
      // 402 Payment Required se considera rechazo definitivo en esta arquitectura (pasarela)
      if (err?.status === 402 || err?.response?.status === 402 || err?.message?.toLowerCase().includes('rechazado')) {
        setStep('PAYMENT_DECLINED');
        sessionStorage.removeItem('tt_checkout_payment_attempt_id');
      } else {
        setStep('ERROR');
      }
      const msg = err instanceof Error ? err.message : 'Error procesando el pago';
      setError(msg);
      return false;
    } finally {
      setProcessing(false);
      submittingRef.current = false;
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
    setCreatedOrder,
    confirmedPayment,
    error,
    setError,
    processing,
    handleCreateOrder,
    handlePay,
  };
}
