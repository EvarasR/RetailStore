import React from 'react';
import { HelpCircle } from 'lucide-react';
import type { SupportTicketItem } from '../../types/support.types';
import { SupportTicketCard } from './SupportTicketCard';
import { Skeleton } from '../ui/Skeleton';

interface SupportTicketListProps {
  tickets: SupportTicketItem[];
  loading: boolean;
  onRespond: (cod_ticket: number, mensaje: string) => Promise<unknown>;
  onCloseTicket: (cod_ticket: number) => Promise<unknown>;
}

export const SupportTicketList: React.FC<SupportTicketListProps> = ({
  tickets,
  loading,
  onRespond,
  onCloseTicket,
}) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Skeleton height="85px" width="100%" />
        <Skeleton height="85px" width="100%" />
        <Skeleton height="85px" width="100%" />
      </div>
    );
  }

  if (tickets.length === 0) {
    return (
      <div
        className="tt-empty-state"
        style={{
          padding: '3.5rem 1.5rem',
          textAlign: 'center',
          backgroundColor: 'var(--tt-color-surface)',
          borderRadius: '0.75rem',
          border: '1px dashed var(--tt-color-border)',
        }}
      >
        <HelpCircle size={42} color="var(--tt-color-text-light)" style={{ margin: '0 auto 0.75rem' }} />
        <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem' }}>No tienes tickets de soporte registrados</h3>
        <p style={{ color: 'var(--tt-color-text-muted)', maxWidth: '440px', margin: '0 auto', fontSize: '0.875rem' }}>
          Si tienes consultas corporativas sobre tus envíos, garantías de equipos o facturas, utiliza el formulario superior para abrir una incidencia en el servidor.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {tickets.map((item) => (
        <SupportTicketCard
          key={item.cod_ticket}
          ticket={item}
          onRespond={onRespond}
          onCloseTicket={onCloseTicket}
        />
      ))}
    </div>
  );
};
