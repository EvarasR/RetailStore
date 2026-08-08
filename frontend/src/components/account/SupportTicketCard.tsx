import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, ChevronDown, ChevronUp, User, ShieldCheck } from 'lucide-react';
import type { SupportTicketItem } from '../../types/support.types';

interface SupportTicketCardProps {
  ticket: SupportTicketItem;
  onRespond: (cod_ticket: number, mensaje: string) => Promise<unknown>;
  onCloseTicket: (cod_ticket: number) => Promise<unknown>;
}

export const SupportTicketCard: React.FC<SupportTicketCardProps> = ({
  ticket,
  onRespond,
  onCloseTicket,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [respuesta, setRespuesta] = useState('');
  const [loadingAction, setLoadingAction] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const getStatusBadge = (st: string) => {
    const code = st ? st.toUpperCase() : 'ABIERTO';
    switch (code) {
      case 'CERRADO':
      case 'RESUELTO':
        return { bg: 'rgba(100, 116, 139, 0.15)', color: 'var(--tt-color-text-light)', label: 'Cerrado' };
      case 'EN_PROCESO':
      case 'RESPONDIDO':
        return { bg: 'rgba(14, 165, 233, 0.15)', color: 'var(--tt-color-primary)', label: 'En Proceso / Respondido' };
      default:
        return { bg: 'rgba(245, 158, 11, 0.15)', color: 'var(--tt-color-warning)', label: 'Abierto / Pendiente' };
    }
  };

  const getPriorityColor = (prio: string) => {
    switch (prio?.toUpperCase()) {
      case 'ALTA':
      case 'URGENTE':
        return 'var(--tt-color-error)';
      case 'MEDIA':
        return 'var(--tt-color-warning)';
      default:
        return 'var(--tt-color-text-light)';
    }
  };

  const badge = getStatusBadge(ticket.estado);
  const prioColor = getPriorityColor(ticket.prioridad);
  const estaCerrado = ticket.estado?.toUpperCase() === 'CERRADO' || ticket.estado?.toUpperCase() === 'RESUELTO';

  const handleSendResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!respuesta.trim()) return;
    setLoadingAction(true);
    setErrorMsg(null);
    try {
      await onRespond(ticket.cod_ticket, respuesta.trim());
      setRespuesta('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo enviar la respuesta al ticket.';
      setErrorMsg(msg);
    } finally {
      setLoadingAction(false);
    }
  };

  const handleClose = async () => {
    if (!window.confirm('¿Deseas cerrar este ticket en el servidor TechTail?')) return;
    setLoadingAction(true);
    setErrorMsg(null);
    try {
      await onCloseTicket(ticket.cod_ticket);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No se pudo cerrar el ticket.';
      setErrorMsg(msg);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div className="tt-support-card" style={{ backgroundColor: 'var(--tt-color-surface)', border: '1px solid var(--tt-color-border)', borderRadius: '0.75rem', overflow: 'hidden', transition: 'border-color 0.2s ease' }}>
      {/* Cabecera del ticket */}
      <div
        style={{ padding: '1.25rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', cursor: 'pointer' }}
        onClick={() => setExpanded(!expanded)}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '0.5rem', backgroundColor: 'rgba(14, 165, 233, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--tt-color-primary)' }}>
            <MessageSquare size={18} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--tt-color-text-light)' }}>
                TICKET #{ticket.cod_ticket}
              </span>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: prioColor, textTransform: 'uppercase' }}>
                • Prioridad {ticket.prioridad || 'MEDIA'}
              </span>
              <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-muted)' }}>
                • {ticket.categoria || 'GENERAL'}
              </span>
            </div>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--tt-color-text-main)', margin: '0.2rem 0 0 0' }}>
              {ticket.asunto}
            </h4>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span
            className="tt-badge"
            style={{
              backgroundColor: badge.bg,
              color: badge.color,
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.25rem 0.65rem',
              borderRadius: '9999px',
            }}
          >
            {badge.label}
          </span>
          <button type="button" className="tt-btn tt-btn--ghost" style={{ padding: '0.35rem' }} aria-label="Expandir ticket">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {/* Cuerpo conversacional expandible */}
      {expanded && (
        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid var(--tt-color-border)', backgroundColor: 'var(--tt-color-surface-hover)' }}>
          {errorMsg && (
            <p style={{ color: 'var(--tt-color-error)', fontSize: '0.875rem', marginBottom: '1rem' }}>
              {errorMsg}
            </p>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {ticket.mensajes && ticket.mensajes.length > 0 ? (
              ticket.mensajes.map((msg, idx) => {
                const esEquipo = msg.autor && msg.autor.toLowerCase().includes('techtail');
                return (
                  <div
                    key={msg.cod_mensaje || idx}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignSelf: esEquipo ? 'flex-start' : 'flex-end',
                      maxWidth: '85%',
                      backgroundColor: esEquipo ? 'var(--tt-color-surface)' : 'rgba(14, 165, 233, 0.12)',
                      border: '1px solid var(--tt-color-border)',
                      borderRadius: '0.75rem',
                      padding: '0.85rem 1rem',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem', gap: '1rem', fontSize: '0.75rem' }}>
                      <span style={{ fontWeight: 700, color: esEquipo ? 'var(--tt-color-primary)' : 'var(--tt-color-text-main)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        {esEquipo ? <ShieldCheck size={13} /> : <User size={13} />}
                        {msg.autor}
                      </span>
                      {msg.fecha && <span style={{ color: 'var(--tt-color-text-light)' }}>{msg.fecha}</span>}
                    </div>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--tt-color-text-main)', lineHeight: 1.4, whiteSpace: 'pre-wrap' }}>
                      {msg.mensaje}
                    </p>
                  </div>
                );
              })
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--tt-color-text-muted)', textAlign: 'center', margin: '1rem 0' }}>
                Sin mensajes en la conversación. Escribe abajo para consultar a nuestro soporte técnico.
              </p>
            )}
          </div>

          {!estaCerrado ? (
            <div>
              <form onSubmit={handleSendResponse} style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="tt-input"
                  style={{ flex: 1, minWidth: '220px' }}
                  placeholder="Escribe tu respuesta para el equipo de soporte..."
                  value={respuesta}
                  onChange={(e) => setRespuesta(e.target.value)}
                  disabled={loadingAction}
                  required
                />
                <button
                  type="submit"
                  className="tt-btn tt-btn--primary"
                  disabled={loadingAction || !respuesta.trim()}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  <Send size={15} />
                  <span>{loadingAction ? 'Enviando...' : 'Responder'}</span>
                </button>
              </form>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button
                  type="button"
                  onClick={handleClose}
                  className="tt-btn tt-btn--ghost"
                  style={{ color: 'var(--tt-color-text-muted)', fontSize: '0.75rem', padding: '0.35rem 0.65rem' }}
                  disabled={loadingAction}
                >
                  <CheckCircle2 size={14} />
                  <span>Marcar ticket como resuelto / cerrar</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '0.75rem', backgroundColor: 'var(--tt-color-surface)', borderRadius: '0.5rem', color: 'var(--tt-color-text-muted)', fontSize: '0.8125rem' }}>
              Este ticket ha sido cerrado por el usuario o resuelto en la base de datos corporativa.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
