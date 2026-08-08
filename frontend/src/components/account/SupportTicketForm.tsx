import React, { useState } from 'react';
import { Send, AlertCircle, PlusCircle } from 'lucide-react';
import type { CreateTicketPayload } from '../../types/support.types';

interface SupportTicketFormProps {
  onCreate: (payload: CreateTicketPayload) => Promise<unknown>;
  onSuccess?: () => void;
}

export const SupportTicketForm: React.FC<SupportTicketFormProps> = ({
  onCreate,
  onSuccess,
}) => {
  const [asunto, setAsunto] = useState('');
  const [categoria, setCategoria] = useState('GENERAL');
  const [prioridad, setPrioridad] = useState('MEDIA');
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!asunto.trim() || !mensaje.trim()) {
      setError('Por favor completa el asunto y el mensaje del ticket.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await onCreate({
        asunto: asunto.trim(),
        categoria,
        prioridad,
        mensaje: mensaje.trim(),
      });
      setAsunto('');
      setCategoria('GENERAL');
      setPrioridad('MEDIA');
      setMensaje('');
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al registrar ticket corporativo en BD.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="tt-support-form"
      style={{
        backgroundColor: 'var(--tt-color-surface)',
        border: '1px solid var(--tt-color-border)',
        borderRadius: '0.75rem',
        padding: '1.75rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
        <PlusCircle size={20} color="var(--tt-color-primary)" />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0 }}>Crear Nuevo Ticket de Soporte</h3>
      </div>

      {error && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            color: 'var(--tt-color-error)',
            padding: '0.75rem 1rem',
            borderRadius: '0.5rem',
            marginBottom: '1.25rem',
            fontSize: '0.875rem',
          }}
        >
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
        <div>
          <label htmlFor="ticket-asunto" className="tt-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.875rem' }}>
            Asunto o Título del Ticket *
          </label>
          <input
            id="ticket-asunto"
            type="text"
            className="tt-input"
            style={{ width: '100%' }}
            placeholder="Ej: Consulta de garantía para producto #203"
            value={asunto}
            onChange={(e) => setAsunto(e.target.value)}
            disabled={loading}
            required
          />
        </div>

        <div>
          <label htmlFor="ticket-categoria" className="tt-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.875rem' }}>
            Categoría del Requerimiento
          </label>
          <select
            id="ticket-categoria"
            className="tt-select"
            style={{ width: '100%' }}
            value={categoria}
            onChange={(e) => setCategoria(e.target.value)}
            disabled={loading}
          >
            <option value="GENERAL">Consulta General</option>
            <option value="PEDIDO">Pedidos y Envíos</option>
            <option value="FACTURACION">Facturación Electrónica</option>
            <option value="TECNICO">Soporte Técnico de Producto</option>
            <option value="GARANTIA">Garantía y Devolución</option>
          </select>
        </div>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label htmlFor="ticket-prioridad" className="tt-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.875rem' }}>
          Prioridad Logística / Operativa
        </label>
        <select
          id="ticket-prioridad"
          className="tt-select"
          style={{ width: '100%' }}
          value={prioridad}
          onChange={(e) => setPrioridad(e.target.value)}
          disabled={loading}
        >
          <option value="BAJA">Baja — Consulta no crítica</option>
          <option value="MEDIA">Media — Soporte estándar</option>
          <option value="ALTA">Alta — Urgencia o pedido en curso</option>
        </select>
      </div>

      <div style={{ marginBottom: '1.5rem' }}>
        <label htmlFor="ticket-mensaje" className="tt-label" style={{ display: 'block', marginBottom: '0.4rem', fontWeight: 600, fontSize: '0.875rem' }}>
          Descripción Detallada del Requerimiento *
        </label>
        <textarea
          id="ticket-mensaje"
          className="tt-textarea"
          style={{ width: '100%', minHeight: '120px' }}
          placeholder="Describe en detalle tu consulta, número de pedido o código de equipo..."
          value={mensaje}
          onChange={(e) => setMensaje(e.target.value)}
          disabled={loading}
          required
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="submit"
          className="tt-btn tt-btn--primary"
          disabled={loading || !asunto.trim() || !mensaje.trim()}
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.6rem 1.25rem' }}
        >
          <Send size={16} />
          <span>{loading ? 'Creando Ticket en BD...' : 'Abrir Ticket de Soporte'}</span>
        </button>
      </div>
    </form>
  );
};
