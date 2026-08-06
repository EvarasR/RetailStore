import React from 'react';
import type { AdminTrackingShipment, AdminTrackingSchedule } from '../../types/adminTracking.types';
import { Truck, Clock, CheckCircle2, Navigation } from 'lucide-react';

interface AdminTrackingTimelineProps {
  envios: AdminTrackingShipment[];
  programaciones: AdminTrackingSchedule[];
  loading: boolean;
  actionLoading: boolean;
  onProcessPending: () => Promise<unknown>;
}

export const AdminTrackingTimeline: React.FC<AdminTrackingTimelineProps> = ({
  envios,
  programaciones,
  loading,
  actionLoading,
  onProcessPending,
}) => {
  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Cargando centro de monitoreo logístico y rastreo...
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <h3
          style={{
            fontSize: '1.1rem',
            fontWeight: 700,
            color: 'var(--color-text)',
            margin: 0,
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          <Truck size={18} color="var(--color-primary)" />
          <span>Envíos Logísticos Oficiales ({envios.length})</span>
        </h3>

        <button
          type="button"
          onClick={onProcessPending}
          disabled={actionLoading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 1rem',
            background: 'var(--color-primary)',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            color: '#fff',
            fontSize: '0.825rem',
            fontWeight: 600,
            cursor: actionLoading ? 'not-allowed' : 'pointer',
            opacity: actionLoading ? 0.7 : 1,
          }}
        >
          <Navigation size={14} />
          <span>{actionLoading ? 'Procesando en BD...' : 'Procesar Tracking Pendiente DB'}</span>
        </button>
      </div>

      <div className="admin-table-container" style={{ marginBottom: '2.5rem' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th># Envío</th>
              <th>Pedido</th>
              <th>Número de Tracking</th>
              <th>Transportista</th>
              <th>Estado Logístico</th>
              <th>Fecha Est. Entrega</th>
            </tr>
          </thead>
          <tbody>
            {envios.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                  No hay envíos en tránsito o programados en PostgreSQL.
                </td>
              </tr>
            ) : (
              envios.map((env) => (
                <tr key={env.cod_envio}>
                  <td style={{ fontWeight: 700 }}>#{env.cod_envio}</td>
                  <td style={{ fontWeight: 600 }}>#{env.pedido}</td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary)' }}>
                    {env.tracking || 'PENDIENTE'}
                  </td>
                  <td>{env.transportista || 'Transporte TechTail'}</td>
                  <td>
                    <span className="status-badge status-active">{env.estado}</span>
                  </td>
                  <td style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>{env.entrega}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <h3
        style={{
          fontSize: '1.1rem',
          fontWeight: 700,
          color: 'var(--color-text)',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
        }}
      >
        <Clock size={18} color="var(--color-warning)" />
        <span>Hitos y Programaciones Logísticas ({programaciones.length})</span>
      </h3>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th># Prog.</th>
              <th>Envío ID</th>
              <th>Evento Programado</th>
              <th>Descripción DB</th>
              <th>Fecha Programada</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {programaciones.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                  No hay hitos programados en cola.
                </td>
              </tr>
            ) : (
              programaciones.map((prog) => (
                <tr key={prog.cod_programacion}>
                  <td style={{ fontWeight: 700 }}>#{prog.cod_programacion}</td>
                  <td>#{prog.cod_envio}</td>
                  <td style={{ fontWeight: 600 }}>{prog.evento}</td>
                  <td style={{ fontSize: '0.85rem' }}>{prog.descripcion}</td>
                  <td style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>{prog.fecha_programada}</td>
                  <td>
                    {prog.procesado ? (
                      <span className="status-badge status-active" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}>
                        <CheckCircle2 size={12} />
                        PROCESADO
                      </span>
                    ) : (
                      <span className="status-badge status-pending">EN COLA</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
