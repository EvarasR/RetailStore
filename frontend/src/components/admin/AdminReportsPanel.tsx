import React from 'react';
import type { AdminReportSaleDay } from '../../types/adminReport.types';
import { BarChart3, TrendingUp, Users, ShoppingBag } from 'lucide-react';

interface AdminReportsPanelProps {
  ventas: AdminReportSaleDay[];
  loading: boolean;
}

export const AdminReportsPanel: React.FC<AdminReportsPanelProps> = ({ ventas, loading }) => {
  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Cargando estadísticas oficiales de ventas consolidadas en DB...
      </div>
    );
  }

  if (ventas.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        No hay registros de ventas diarias en el periodo seleccionado en PostgreSQL.
      </div>
    );
  }

  // Encontrar máximo valor de pedidos para calcular ancho de barra visual CSS
  const maxPedidos = Math.max(...ventas.map((v) => v.total_pedidos), 1);

  return (
    <div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        <div className="admin-metric-card">
          <div className="metric-header">
            <span>Días Registrados</span>
            <CalendarIcon />
          </div>
          <div className="metric-value">{ventas.length}</div>
          <div className="metric-footer">Historial reciente de ventas</div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-header">
            <span>Última Venta Diaria DB</span>
            <TrendingUp size={16} color="var(--color-success)" />
          </div>
          <div className="metric-value">{ventas[0]?.total_ventas || '$0.00'}</div>
          <div className="metric-footer">Fecha: {ventas[0]?.fecha || 'N/A'}</div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-header">
            <span>Pedidos en Último Día</span>
            <ShoppingBag size={16} color="var(--color-primary)" />
          </div>
          <div className="metric-value">{ventas[0]?.total_pedidos || 0}</div>
          <div className="metric-footer">Clientes únicos: {ventas[0]?.total_clientes || 0}</div>
        </div>

        <div className="admin-metric-card">
          <div className="metric-header">
            <span>Ticket Promedio DB</span>
            <Users size={16} color="var(--color-warning)" />
          </div>
          <div className="metric-value">{ventas[0]?.ticket_promedio || '$0.00'}</div>
          <div className="metric-footer">Calculado por motor fiscal</div>
        </div>
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
        <BarChart3 size={18} color="var(--color-primary)" />
        <span>Evolución Diaria de Ventas y Rendimiento Oficial (Últimos 30 días)</span>
      </h3>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Fecha del Registro</th>
              <th>Total Pedidos</th>
              <th>Actividad Visual (Pedidos)</th>
              <th>Clientes Únicos</th>
              <th>Total Ventas DB ($)</th>
              <th>Ticket Promedio DB ($)</th>
            </tr>
          </thead>
          <tbody>
            {ventas.map((v) => {
              const percentage = Math.round((v.total_pedidos / maxPedidos) * 100);
              return (
                <tr key={v.fecha}>
                  <td style={{ fontWeight: 700 }}>{v.fecha}</td>
                  <td style={{ fontWeight: 600 }}>{v.total_pedidos}</td>
                  <td style={{ width: '220px' }}>
                    <div
                      style={{
                        width: '100%',
                        height: '10px',
                        background: 'var(--color-border)',
                        borderRadius: '999px',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.max(percentage, 4)}%`,
                          height: '100%',
                          background: 'var(--color-primary)',
                          borderRadius: '999px',
                          transition: 'width 0.3s ease',
                        }}
                      />
                    </div>
                  </td>
                  <td>{v.total_clientes}</td>
                  <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>{v.total_ventas}</td>
                  <td style={{ fontWeight: 600 }}>{v.ticket_promedio}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const CalendarIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);
