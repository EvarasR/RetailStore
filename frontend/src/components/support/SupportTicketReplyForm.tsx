import React, { useState } from 'react';
import { Send, CheckCircle2, AlertTriangle, Loader2, Lock, CheckSquare } from 'lucide-react';

interface SupportTicketReplyFormProps {
  cod_ticket: number;
  loading: boolean;
  onReply: (cod_ticket: number, mensaje: string, estado?: string, interno?: boolean) => Promise<unknown>;
  onCloseTicket: (cod_ticket: number, mensaje?: string) => Promise<unknown>;
  onSuccess?: () => void;
}

export const SupportTicketReplyForm: React.FC<SupportTicketReplyFormProps> = ({
  cod_ticket,
  loading,
  onReply,
  onCloseTicket,
  onSuccess,
}) => {
  const [mensaje, setMensaje] = useState('');
  const [estado, setEstado] = useState('EN_PROCESO');
  const [interno, setInterno] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mensaje.trim()) {
      setErrorMsg('Debes ingresar un mensaje o respuesta para el ticket.');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await onReply(cod_ticket, mensaje.trim(), estado, interno);
      setSuccessMsg(
        interno
          ? 'Nota interna guardada en PostgreSQL (no visible por cliente).'
          : 'Respuesta transmitida al ticket en base de datos.'
      );
      setMensaje('');
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : 'El servidor rechazó la respuesta del ticket.';
      setErrorMsg(text);
    }
  };

  const handleQuickClose = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await onCloseTicket(
        cod_ticket,
        'Ticket marcado como RESUELTO por el equipo operativo de Soporte TechTail.'
      );
      setSuccessMsg('Estado del ticket actualizado a RESUELTO en PostgreSQL.');
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : 'No se pudo cambiar el estado del ticket.';
      setErrorMsg(text);
    }
  };

  return (
    <div
      style={{
        background: '#0f172a',
        border: '1px solid #334155',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        marginTop: '1rem',
      }}
    >
      <h5 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span>Responder o Gestionar Ticket DB-First</span>
        <button
          type="button"
          onClick={handleQuickClose}
          disabled={loading}
          className="tt-btn tt-btn--secondary"
          style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', borderColor: '#047857' }}
          title="Marcar ticket inmediatamente como RESUELTO en la base de datos"
        >
          <CheckSquare size={14} />
          <span>Marcar Resuelto</span>
        </button>
      </h5>

      {errorMsg && (
        <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.7rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#10b981', padding: '0.7rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmitReply}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ flex: '1 1 180px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.35rem' }}>
              Estado del Ticket:
            </label>
            <select
              value={estado}
              onChange={(e) => setEstado(e.target.value)}
              disabled={loading}
              className="ops-filter-select"
              style={{ width: '100%' }}
            >
              <option value="EN_PROCESO">EN_PROCESO (En seguimiento)</option>
              <option value="ABIERTO">ABIERTO (Por clasificar)</option>
              <option value="RESUELTO">RESUELTO (Cerrar atención)</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#f59e0b' }}>
              <input
                type="checkbox"
                checked={interno}
                onChange={(e) => setInterno(e.target.checked)}
                disabled={loading}
              />
              <Lock size={15} />
              <span>Nota Interna (Sólo Agentes)</span>
            </label>
          </div>
        </div>

        <div style={{ marginBottom: '1rem' }}>
          <textarea
            value={mensaje}
            onChange={(e) => setMensaje(e.target.value)}
            disabled={loading}
            placeholder={
              interno
                ? 'Escribe un comentario interno o auditoría para el equipo de Soporte...'
                : 'Escribe tu respuesta al cliente...'
            }
            rows={3}
            style={{
              width: '100%',
              background: '#111827',
              border: '1px solid #334155',
              color: '#f8fafc',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              fontSize: '0.9rem',
              fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="submit"
            disabled={loading || !mensaje.trim()}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '0.5rem',
              background: loading || !mensaje.trim() ? '#475569' : '#3b82f6',
              color: '#ffffff',
              border: 'none',
              fontWeight: 600,
              cursor: loading || !mensaje.trim() ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            <Send size={15} />
            <span>{interno ? 'Registrar Nota Interna' : 'Enviar Respuesta'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
