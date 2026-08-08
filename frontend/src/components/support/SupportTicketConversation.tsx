import React from 'react';
import { User, Lock, Clock, MessageSquare } from 'lucide-react';
import type { SupportMessageItem } from '../../types/supportInternal.types';

interface SupportTicketConversationProps {
  mensajes: SupportMessageItem[];
}

export const SupportTicketConversation: React.FC<SupportTicketConversationProps> = ({ mensajes }) => {
  if (!mensajes || mensajes.length === 0) {
    return (
      <div
        style={{
          background: 'var(--tt-color-text-main)',
          border: '1px solid var(--tt-color-surface-subtle)',
          padding: '2rem',
          borderRadius: '0.75rem',
          textAlign: 'center',
          color: 'var(--tt-color-text-light)',
        }}
      >
        <MessageSquare size={24} style={{ margin: '0 auto 0.5rem', opacity: 0.5 }} />
        <p style={{ margin: 0, fontSize: '0.9rem' }}>
          Este ticket aún no cuenta con respuestas ni comentarios registrados en PostgreSQL.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
      {mensajes.map((msg, idx) => {
        const isInternal = msg.interno === true;
        return (
          <div
            key={msg.cod_mensaje || idx}
            style={{
              background: isInternal
                ? 'rgba(245, 158, 11, 0.08)'
                : 'var(--tt-color-text-main)',
              border: '1px solid',
              borderColor: isInternal ? 'var(--tt-color-warning)' : 'var(--tt-color-surface-subtle)',
              borderRadius: '0.75rem',
              padding: '1rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {isInternal ? (
                  <Lock size={15} color="var(--tt-color-warning)" />
                ) : (
                  <User size={16} color="var(--tt-color-primary)" />
                )}
                <strong style={{ color: isInternal ? 'var(--tt-color-warning)' : 'var(--tt-color-text-main)', fontSize: '0.9rem' }}>
                  {msg.autor || 'Usuario / Agente'}
                </strong>
                {isInternal && (
                  <span style={{ background: '#78350f', color: '#fef3c7', padding: '0.15rem 0.5rem', borderRadius: '9999px', fontSize: '0.7rem', fontWeight: 600 }}>
                    NOTA INTERNA
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--tt-color-text-light)', fontSize: '0.75rem' }}>
                <Clock size={12} />
                <span>{msg.fecha || 'Reciente'}</span>
              </div>
            </div>

            <p style={{ margin: 0, color: '#e2e8f0', fontSize: '0.9rem', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
              {msg.mensaje}
            </p>
          </div>
        );
      })}
    </div>
  );
};
