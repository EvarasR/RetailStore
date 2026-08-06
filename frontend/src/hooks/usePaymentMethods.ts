import { useState, useEffect, useCallback } from 'react';
import {
  fetchPaymentMethods,
  registerPaymentMethod as apiRegisterPaymentMethod,
  authorizePayment as apiAuthorizePayment,
  capturePayment as apiCapturePayment,
} from '../api/payments.api';
import type { PaymentMethod } from '../types/payment.types';
import { useAuth } from './useAuth';

export function usePaymentMethods() {
  const { autenticado: isAuthenticated, loading: authLoading } = useAuth();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadMethods = useCallback(async () => {
    if (authLoading) return;
    if (!isAuthenticated) {
      setMethods([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPaymentMethods();
      setMethods(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar métodos de pago';
      setError(msg);
      setMethods([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    loadMethods();
  }, [loadMethods]);

  const registerMethod = async (data: {
    numero_tarjeta: string;
    titular: string;
    exp_mes: string | number;
    exp_anio: string | number;
    cvv: string;
  }) => {
    const res = await apiRegisterPaymentMethod(data);
    await loadMethods();
    return res;
  };

  return {
    methods,
    loading,
    error,
    registerMethod,
    authorizePayment: apiAuthorizePayment,
    capturePayment: apiCapturePayment,
    refreshMethods: loadMethods,
  };
}
