import { useState, useEffect, useCallback } from 'react';
import { fetchAdminPayments } from '../api/adminPayments.api';
import type {
  AdminPaymentTransaction,
  AdminPaymentAuthorization,
  AdminPaymentRefund,
  AdminPaymentInvoice,
  AdminPaymentReturn,
} from '../types/adminPayment.types';

export function useAdminPayments() {
  const [transacciones, setTransacciones] = useState<AdminPaymentTransaction[]>([]);
  const [autorizaciones, setAutorizaciones] = useState<AdminPaymentAuthorization[]>([]);
  const [reembolsos, setReembolsos] = useState<AdminPaymentRefund[]>([]);
  const [facturas, setFacturas] = useState<AdminPaymentInvoice[]>([]);
  const [devoluciones, setDevoluciones] = useState<AdminPaymentReturn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchAdminPayments();
      setTransacciones(data.transacciones || []);
      setAutorizaciones(data.autorizaciones || []);
      setReembolsos(data.reembolsos || []);
      setFacturas(data.facturas || []);
      setDevoluciones(data.devoluciones || []);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar módulo de pagos.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments();
  }, [loadPayments]);

  return {
    transacciones,
    autorizaciones,
    reembolsos,
    facturas,
    devoluciones,
    loading,
    error,
    reload: loadPayments,
  };
}
