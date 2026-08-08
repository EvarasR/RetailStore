import React from 'react';
import { AccountLayout } from '../../components/account/AccountLayout';
import { SupportTicketList } from '../../components/account/SupportTicketList';
import { SupportTicketForm } from '../../components/account/SupportTicketForm';
import { useSupport } from '../../hooks/useSupport';
import { Alert } from '../../components/ui/Alert';

export const SupportPage: React.FC = () => {
  const {
    tickets,
    loading,
    error,
    createTicket,
    respondTicket,
    closeTicket,
  } = useSupport();

  return (
    <AccountLayout
      title="Mesa de Soporte Técnico y Tickets"
      subtitle="Atención especializada corporativa para incidencias con pedidos, garantías de equipos o consultas fiscales."
    >
      {error && <Alert variant="error">{error}</Alert>}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        {/* Formulario superior para registrar una nueva incidencia */}
        <SupportTicketForm onCreate={createTicket} />

        {/* Listado conversacional de tickets */}
        <div>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--tt-color-text-main)' }}>
            Mis Incidencias y Requerimientos ({tickets.length})
          </h3>
          <SupportTicketList
            tickets={tickets}
            loading={loading}
            onRespond={respondTicket}
            onCloseTicket={closeTicket}
          />
        </div>
      </div>
    </AccountLayout>
  );
};
