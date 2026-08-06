import { useState, useEffect, useCallback } from 'react';
import {
  fetchMembershipData,
  fetchPaymentMethods,
  payMembership,
  cancelMembership,
} from '../api/membership.api';
import type {
  MembershipActive,
  MembershipPlan,
  MembershipHistoryItem,
  MembershipPaymentItem,
  PaymentMethodItem,
} from '../types/membership.types';

export function useMembership() {
  const [membership, setMembership] = useState<MembershipActive | null>(null);
  const [planes, setPlanes] = useState<MembershipPlan[]>([]);
  const [historial, setHistorial] = useState<MembershipHistoryItem[]>([]);
  const [pagos, setPagos] = useState<MembershipPaymentItem[]>([]);
  const [metodosPago, setMetodosPago] = useState<PaymentMethodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMembership = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [resMem, resPay] = await Promise.all([
        fetchMembershipData(),
        fetchPaymentMethods().catch(() => ({ ok: true, metodos: [] })),
      ]);
      if (resMem.ok) {
        setMembership(resMem.membresia || null);
        setPlanes(resMem.planes || []);
        setHistorial(resMem.historial || []);
        setPagos(resMem.pagos || []);
      } else {
        setError('No se pudo cargar la información de la membresía.');
      }
      if (resPay && resPay.ok) {
        setMetodosPago(resPay.metodos || []);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al cargar membresía en el servidor.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const payPrime = useCallback(
    async (
      cod_plan: string | number,
      cod_metodo_pago: number,
      renovacion_automatica = true,
      idempotency_key = ''
    ) => {
      const res = await payMembership(cod_plan, cod_metodo_pago, renovacion_automatica, idempotency_key);
      if (!res.ok) {
        throw new Error(res.mensaje || 'Error al procesar el pago de membresía Prime.');
      }
      await loadMembership();
      return res;
    },
    [loadMembership]
  );

  const cancelPrime = useCallback(async () => {
    const res = await cancelMembership();
    if (!res.ok) {
      throw new Error(res.mensaje || 'Error al cancelar la membresía en el servidor.');
    }
    await loadMembership();
    return res;
  }, [loadMembership]);

  useEffect(() => {
    loadMembership();
  }, [loadMembership]);

  return {
    membership,
    planes,
    historial,
    pagos,
    metodosPago,
    loading,
    error,
    loadMembership,
    payPrime,
    cancelPrime,
  };
}
