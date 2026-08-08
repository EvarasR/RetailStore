import React from 'react';
import { X, MessageSquare, Calendar, User } from 'lucide-react';
import type { SupportTicketItem } from '../../types/supportInternal.types';
import { SupportTicketConversation } from './SupportTicketConversation';
import { SupportTicketReplyForm } from './SupportTicketReplyForm';

interface SupportTicketDrawerProps {
  ticket: SupportTicketItem | null;
  loading: boolean;
  onClose: () => void;
  onReply: (cod_ticket: number, mensaje: string, estado?: string, interno?: boolean) => Promise<unknown>;
  onCloseTicket: (cod_ticket: number, mensaje?: string) => Promise<unknown>;
  onReload?: () => void;
}

export const SupportTicketDrawer: React.FC<SupportTicketDrawerProps> = ({
  ticket,
  loading,
  onClose,
  onReply,
  onCloseTicket,
  onReload,
}) => {
  if (!ticket) return null;

  return (
    <div className="ops-drawer-overlay" onClick={onClose}>
      <div className="ops-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ops-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <MessageSquare size={20} color="var(--tt-color-primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--tt-color-text-main)' }}>
              Bitácora DB-First de Atención al Cliente
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--tt-color-text-light)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="ops-drawer-body">
          <div style={{ background: 'var(--tt-color-text-main)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-surface-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--tt-color-text-light)', textTransform: 'uppercase' }}>
                TICKET #{ticket.cod_ticket}
              </span>
              <span
                className={
                  ticket.estado === 'ABIERTO'
                    ? 'ops-badge ops-badge--critica'
                    : ticket.estado === 'RESUELTO' || ticket.estado === 'CERRADO'
                    ? 'ops-badge ops-badge--ok'
                    : 'ops-badge ops-badge--media'
                }
              >
                {ticket.estado}
              </span>
            </div>

            <h4 style={{ margin: '0.5rem 0 0.5rem', fontSize: '1.25rem', color: 'var(--tt-color-text-main)' }}>
              {ticket.asunto}
            </h4>

            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              <span className="ops-badge ops-badge--media">
                Categoría: {ticket.categoria}
              </span>
              <span className="ops-badge ops-badge--media">
                Prioridad: {ticket.prioridad}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{ background: 'var(--tt-color-text-main)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-surface-subtle)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--tt-color-text-light)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <User size={15} />
                <span>Cliente Solicitante</span>
              </span>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--tt-color-text-main)', marginTop: '0.25rem' }}>
                {ticket.cliente || `Usuario #${ticket.cod_usuario || 'N/A'}`}
              </div>
            </div>

            <div style={{ background: 'var(--tt-color-text-main)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-surface-subtle)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--tt-color-text-light)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Calendar size={15} />
                <span>Fecha Apertura</span>
              </span>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: '#e2e8f0', marginTop: '0.25rem' }}>
                {ticket.fecha}
              </div>
            </div>
          </div>

          <div>
            <h5 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>Conversación y Seguimiento ({ticket.mensajes?.length || 0})</span>
            </h5>
            <SupportTicketConversation mensajes={ticket.mensajes || []} />
          </div>

          <SupportTicketReplyForm
            cod_ticket={ticket.cod_ticket}
            loading={loading}
            onReply={onReply}
            onCloseTicket={onCloseTicket}
            onSuccess={onReload}
          />
        </div>

        <div className="ops-drawer-footer">
          <button
            onClick={onClose}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '0.5rem',
              background: 'var(--tt-color-border-dark)',
              color: 'var(--tt-color-text-main)',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
