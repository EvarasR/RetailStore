import { useState, useEffect, useCallback } from 'react';
import {
  fetchSupportTickets,
  createSupportTicket,
  respondSupportTicket,
  closeSupportTicket,
} from '../api/support.api';
import type { SupportTicketItem, CreateTicketPayload } from '../types/support.types';

export function useSupport() {
  const [tickets, setTickets] = useState<SupportTicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchSupportTickets();
      if (res.ok) {
        setTickets(res.tickets || []);
      } else {
        setError('No se pudieron cargar los tickets de soporte.');
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al consultar tickets en el servidor.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  const createTicket = useCallback(async (payload: CreateTicketPayload) => {
    const res = await createSupportTicket(payload);
    if (!res.ok) {
      throw new Error(res.mensaje || 'Error al crear ticket en el servidor.');
    }
    await loadTickets();
    return res;
  }, [loadTickets]);

  const respondTicket = useCallback(async (cod_ticket: number, mensaje: string) => {
    const res = await respondSupportTicket(cod_ticket, mensaje);
    if (!res.ok) {
      throw new Error(res.mensaje || 'Error al enviar respuesta al ticket.');
    }
    await loadTickets();
    return res;
  }, [loadTickets]);

  const closeTicket = useCallback(async (cod_ticket: number, mensaje?: string) => {
    const res = await closeSupportTicket(cod_ticket, mensaje);
    if (!res.ok) {
      throw new Error(res.mensaje || 'Error al cerrar el ticket en el servidor.');
    }
    await loadTickets();
    return res;
  }, [loadTickets]);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  return {
    tickets,
    loading,
    error,
    loadTickets,
    createTicket,
    respondTicket,
    closeTicket,
  };
}
