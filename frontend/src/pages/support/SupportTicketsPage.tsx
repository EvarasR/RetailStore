import React, { useState, useMemo } from 'react';
import { SupportLayout } from '../../components/support/SupportLayout';
import { useSupportInternal } from '../../hooks/useSupportInternal';
import { SupportFilters } from '../../components/support/SupportFilters';
import { SupportTicketDrawer } from '../../components/support/SupportTicketDrawer';
import {
  MessageSquare,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Eye,
  CheckSquare,
} from 'lucide-react';
import type { SupportTicketItem } from '../../types/supportInternal.types';

export const SupportTicketsPage: React.FC = () => {
  const { tickets, loading, error, actionLoading, handleRespond, handleClose, reload } = useSupportInternal();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicketItem | null>(null);
  const [mensajeOk, setMensajeOk] = useState<string | null>(null);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const matchesSearch =
        (t.asunto && t.asunto.toLowerCase().includes(searchTerm.toLowerCase())) ||
        String(t.cod_ticket).includes(searchTerm) ||
        (t.cliente && t.cliente.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (t.email && t.email.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesStatus = selectedStatus ? t.estado === selectedStatus : true;
      const matchesPriority = selectedPriority ? t.prioridad === selectedPriority : true;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tickets, searchTerm, selectedStatus, selectedPriority]);

  const handleQuickClose = async (tk: SupportTicketItem) => {
    setMensajeOk(null);
    try {
      const res = await handleClose(tk.cod_ticket, 'Ticket marcado como resuelto desde el listado');
      setMensajeOk(res.mensaje || `Ticket #${tk.cod_ticket} cerrado como RESUELTO en base de datos`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'No se pudo cerrar el ticket en BD');
    }
  };

  return (
    <SupportLayout title="Mesa de Ayuda - Gestión de Tickets">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>
            Bandeja de Tickets y Soporte Técnico DB-First
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
            Atención conversacional, notas internas y resolución directa vinculada a PostgreSQL
          </p>
        </div>

        <button
          onClick={reload}
          disabled={loading}
          className="tt-btn tt-btn--secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
        >
          <RefreshCw size={15} />
          <span>Actualizar Bandeja</span>
        </button>
      </div>

      <SupportFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        statusOptions={['TODOS', 'ABIERTO', 'EN_PROCESO', 'RESUELTO', 'CERRADO']}
        selectedPriority={selectedPriority}
        onPriorityChange={setSelectedPriority}
        priorityOptions={['TODAS', 'ALTA', 'MEDIA', 'BAJA']}
        onReset={() => {
          setSearchTerm('');
          setSelectedStatus('');
          setSelectedPriority('');
        }}
        placeholder="Buscar por asunto, cliente, correo o ticket #..."
      />

      {mensajeOk && (
        <div className="tt-alert tt-alert--success" style={{ marginBottom: '1.25rem' }}>
          <CheckCircle2 size={18} />
          <span>{mensajeOk}</span>
        </div>
      )}

      {error && (
        <div className="tt-alert tt-alert--error" style={{ marginBottom: '1.25rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="ops-table-card">
        <div className="ops-table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MessageSquare size={18} color="#60a5fa" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
              Tickets Registrados ({filteredTickets.length})
            </h3>
          </div>
        </div>

        <div className="ops-table-container">
          <table className="ops-table">
            <thead>
              <tr>
                <th>ID Ticket</th>
                <th>Cliente</th>
                <th>Asunto / Categoría</th>
                <th>Prioridad</th>
                <th>Estado BD</th>
                <th>Fecha Apertura</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    Cargando tickets desde el servidor en PostgreSQL...
                  </td>
                </tr>
              ) : filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No hay tickets que coincidan con los criterios aplicados
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr key={t.cod_ticket}>
                    <td style={{ color: '#94a3b8', fontWeight: 600 }}>#{t.cod_ticket}</td>
                    <td style={{ fontWeight: 600 }}>
                      <div>{t.cliente || `Usuario #${t.cod_usuario || 'N/A'}`}</div>
                      {t.email && (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{t.email}</div>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: '#f8fafc', display: 'block', fontSize: '0.9rem' }}>
                        {t.asunto}
                      </strong>
                      <span style={{ fontSize: '0.75rem', color: '#60a5fa' }}>{t.categoria}</span>
                    </td>
                    <td>
                      <span
                        className={
                          t.prioridad === 'ALTA'
                            ? 'ops-badge ops-badge--critica'
                            : 'ops-badge ops-badge--media'
                        }
                      >
                        {t.prioridad}
                      </span>
                    </td>
                    <td>
                      <span
                        className={
                          t.estado === 'ABIERTO'
                            ? 'ops-badge ops-badge--critica'
                            : t.estado === 'RESUELTO' || t.estado === 'CERRADO'
                            ? 'ops-badge ops-badge--ok'
                            : 'ops-badge ops-badge--media'
                        }
                      >
                        {t.estado}
                      </span>
                    </td>
                    <td style={{ color: '#cbd5e1' }}>{t.fecha}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => setSelectedTicket(t)}
                          className="tt-btn tt-btn--secondary"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                          title="Abrir conversación y responder al cliente"
                        >
                          <Eye size={13} />
                          <span>Atender</span>
                        </button>

                        {t.estado !== 'RESUELTO' && t.estado !== 'CERRADO' && (
                          <button
                            onClick={() => handleQuickClose(t)}
                            disabled={actionLoading}
                            className="tt-btn tt-btn--secondary"
                            style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#10b981', borderColor: '#047857' }}
                            title="Marcar ticket rápidamente como resuelto"
                          >
                            <CheckSquare size={13} />
                            <span>Resolver</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SupportTicketDrawer
        ticket={selectedTicket}
        loading={actionLoading}
        onClose={() => setSelectedTicket(null)}
        onReply={async (cod, msj, est, int) => {
          const res = await handleRespond(cod, msj, est, int);
          setMensajeOk('Respuesta de ticket registrada con éxito en PostgreSQL.');
          return res;
        }}
        onCloseTicket={async (cod, msj) => {
          const res = await handleClose(cod, msj);
          setMensajeOk('Estado del ticket actualizado a RESUELTO con éxito.');
          return res;
        }}
        onReload={() => {
          reload();
        }}
      />
    </SupportLayout>
  );
};
