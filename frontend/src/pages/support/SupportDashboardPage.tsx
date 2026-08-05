import React from 'react';
import { SupportLayout } from '../../components/support/SupportLayout';
import { useSupportInternal } from '../../hooks/useSupportInternal';
import {
  MessageSquare,
  AlertOctagon,
  RefreshCw,
  AlertTriangle,
  ArrowRight,
  ClipboardList,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const SupportDashboardPage: React.FC = () => {
  const { dashboard, tickets, incidencias, loading, error, reload } = useSupportInternal();

  return (
    <SupportLayout title="Dashboard de Soporte Interno TechTail">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
            Centro Ejecutivo de Atención al Cliente
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
            Gestión DB-First de tickets de clientes, incidencias en transporte y devoluciones
          </p>
        </div>

        <button
          onClick={reload}
          disabled={loading}
          className="tt-btn tt-btn--secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <RefreshCw size={16} className={loading ? 'tt-spin' : ''} />
          <span>Actualizar</span>
        </button>
      </div>

      {error && (
        <div className="tt-alert tt-alert--error" style={{ marginBottom: '1.5rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      {/* Grid de KPI Cards */}
      <div className="ops-metrics-grid">
        <div className="ops-metric-card">
          <span className="ops-metric-title">Tickets Abiertos</span>
          <span className="ops-metric-value" style={{ color: '#fbbf24' }}>
            {dashboard.tickets_abiertos}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Consultas y reclamos en cola
          </span>
        </div>

        <div className="ops-metric-card">
          <span className="ops-metric-title">Urgentes / Prioridad Alta</span>
          <span className="ops-metric-value" style={{ color: '#ef4444' }}>
            {dashboard.tickets_urgentes}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Atención prioritaria SLA &lt; 2h
          </span>
        </div>

        <div className="ops-metric-card">
          <span className="ops-metric-title">Incidencias Operativas</span>
          <span className="ops-metric-value" style={{ color: '#f59e0b' }}>
            {dashboard.pedidos_con_incidencia}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Retenciones y problemas logísticos
          </span>
        </div>

        <div className="ops-metric-card">
          <span className="ops-metric-title">Devoluciones Pendientes</span>
          <span className="ops-metric-value" style={{ color: '#60a5fa' }}>
            {dashboard.devoluciones_pendientes}
          </span>
          <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            Solicitadas por clientes
          </span>
        </div>
      </div>

      {/* Sección Doble: Tickets Recientes y Pedidos con Incidencia */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="ops-table-card" style={{ marginBottom: 0 }}>
          <div className="ops-table-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <MessageSquare size={18} color="#fbbf24" />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                Tickets Recientes de Clientes
              </h3>
            </div>
            <Link
              to="/support/tickets"
              style={{ fontSize: '0.8rem', color: '#fbbf24', textDecoration: 'none', fontWeight: 600 }}
            >
              Ver Todos →
            </Link>
          </div>

          <div className="ops-table-container">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Ticket #</th>
                  <th>Cliente</th>
                  <th>Asunto</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      No hay tickets pendientes en el sistema
                    </td>
                  </tr>
                ) : (
                  tickets.slice(0, 5).map((tk) => (
                    <tr key={tk.cod_ticket}>
                      <td style={{ fontWeight: 700, color: '#fbbf24' }}>#{tk.cod_ticket}</td>
                      <td style={{ fontWeight: 600 }}>{tk.cliente || tk.email || 'Cliente TechTail'}</td>
                      <td>{tk.asunto}</td>
                      <td>
                        <span className="ops-badge ops-badge--media">{tk.estado}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="ops-table-card" style={{ marginBottom: 0 }}>
          <div className="ops-table-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertOctagon size={18} color="#ef4444" />
              <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
                Alertas de Envío e Incidencias
              </h3>
            </div>
            <Link
              to="/support/incidencias"
              style={{ fontSize: '0.8rem', color: '#fbbf24', textDecoration: 'none', fontWeight: 600 }}
            >
              Ver Incidencias →
            </Link>
          </div>

          <div className="ops-table-container">
            <table className="ops-table">
              <thead>
                <tr>
                  <th>Pedido #</th>
                  <th>Cliente</th>
                  <th>Incidencia</th>
                  <th>Estado BD</th>
                </tr>
              </thead>
              <tbody>
                {incidencias.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#94a3b8' }}>
                      No se registran incidencias operativas activas
                    </td>
                  </tr>
                ) : (
                  incidencias.slice(0, 5).map((inc, idx) => (
                    <tr key={inc.cod_incidencia || idx}>
                      <td style={{ fontWeight: 700, color: '#ef4444' }}>
                        #{inc.cod_pedido || idx + 100}
                      </td>
                      <td style={{ fontWeight: 600 }}>{inc.cliente}</td>
                      <td style={{ fontSize: '0.85rem' }}>{inc.descripcion}</td>
                      <td>
                        <span className="ops-badge ops-badge--critica">{inc.estado}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Accesos de Atención */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
        <Link
          to="/support/tickets"
          className="ops-metric-card"
          style={{ textDecoration: 'none', border: '1px solid #f59e0b', background: 'rgba(245, 158, 11, 0.05)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <MessageSquare size={22} color="#fbbf24" />
            <ArrowRight size={18} color="#fbbf24" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc', marginTop: '0.5rem' }}>
            Atención de Tickets
          </span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Responder y cerrar consultas con registro en base de datos
          </span>
        </Link>

        <Link
          to="/support/incidencias"
          className="ops-metric-card"
          style={{ textDecoration: 'none', border: '1px solid #ef4444', background: 'rgba(239, 68, 68, 0.05)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <AlertOctagon size={22} color="#ef4444" />
            <ArrowRight size={18} color="#ef4444" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc', marginTop: '0.5rem' }}>
            Resolver Incidencias
          </span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Gestión de reclamos en transporte, retrasos y pérdidas
          </span>
        </Link>

        <Link
          to="/support/pedidos"
          className="ops-metric-card"
          style={{ textDecoration: 'none', border: '1px solid #3b82f6', background: 'rgba(59, 130, 246, 0.05)' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <ClipboardList size={22} color="#60a5fa" />
            <ArrowRight size={18} color="#60a5fa" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '1rem', color: '#f8fafc', marginTop: '0.5rem' }}>
            Rastreo de Pedidos
          </span>
          <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
            Consultar datos de despacho, guías y transacciones
          </span>
        </Link>
      </div>
    </SupportLayout>
  );
};
