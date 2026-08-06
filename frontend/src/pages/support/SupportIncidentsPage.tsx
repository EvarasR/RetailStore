import React, { useState, useMemo } from 'react';
import { SupportLayout } from '../../components/support/SupportLayout';
import { useSupportInternal } from '../../hooks/useSupportInternal';
import { SupportFilters } from '../../components/support/SupportFilters';
import { AlertOctagon, AlertTriangle, RefreshCw, Eye, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SupportIncidentsPage: React.FC = () => {
  const { incidencias, loading, error, reload } = useSupportInternal();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredIncidents = useMemo(() => {
    return incidencias.filter((inc) => {
      return (
        (inc.cliente || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(inc.cod_pedido || '').includes(searchTerm) ||
        inc.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [incidencias, searchTerm]);

  return (
    <SupportLayout title="Incidencias y Retenciones Operativas">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>
            Alertas en Transporte, Retenciones y Devoluciones
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
            Derivación expositiva de órdenes que requieren intervención del equipo de soporte (DB-First)
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <a
            href="/panel/"
            target="_blank"
            rel="noreferrer"
            className="tt-btn tt-btn--secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', textDecoration: 'none', color: '#60a5fa' }}
            title="Escalar incidencia a nivel administrativo en Django /panel/"
          >
            <span>Escalar a /panel/</span>
            <ExternalLink size={14} />
          </a>
          <button
            onClick={reload}
            disabled={loading}
            className="tt-btn tt-btn--secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
          >
            <RefreshCw size={15} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      <SupportFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus=""
        onStatusChange={() => {}}
        statusOptions={[]}
        onReset={() => {
          setSearchTerm('');
        }}
        placeholder="Buscar por cliente, pedido # o descripción de incidencia..."
      />

      {error && (
        <div className="tt-alert tt-alert--error" style={{ marginBottom: '1.25rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="ops-table-card">
        <div className="ops-table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertOctagon size={18} color="#ef4444" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
              Incidencias y Retenciones Activas ({filteredIncidents.length})
            </h3>
          </div>
        </div>

        <div className="ops-table-container">
          <table className="ops-table">
            <thead>
              <tr>
                <th>ID Incidencia</th>
                <th>Pedido #</th>
                <th>Cliente</th>
                <th>Descripción DB</th>
                <th>Estado BD</th>
                <th>Fecha Reporte</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    Consultando incidencias logísticas desde PostgreSQL...
                  </td>
                </tr>
              ) : filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No hay incidencias que coincidan con la búsqueda actual
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((inc, idx) => (
                  <tr key={inc.cod_incidencia || idx}>
                    <td style={{ color: '#94a3b8' }}>
                      #{inc.cod_incidencia || idx + 1}
                    </td>
                    <td style={{ fontWeight: 700, color: '#38bdf8' }}>
                      #{inc.cod_pedido || idx + 100}
                    </td>
                    <td style={{ fontWeight: 600 }}>{inc.cliente || 'Cliente TechTail'}</td>
                    <td>{inc.descripcion}</td>
                    <td>
                      <span className="ops-badge ops-badge--critica">{inc.estado}</span>
                    </td>
                    <td style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
                      {inc.fecha || 'Reciente'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <Link
                          to="/support/pedidos"
                          className="tt-btn tt-btn--secondary"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                          title="Ver pedidos en el módulo de Soporte"
                        >
                          <Eye size={13} />
                          <span>Pedido</span>
                        </Link>
                        <a
                          href="/panel/"
                          target="_blank"
                          rel="noreferrer"
                          className="tt-btn tt-btn--secondary"
                          style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: '#60a5fa' }}
                          title="Abrir incidencia en panel corporativo /panel/"
                        >
                          <ExternalLink size={13} />
                          <span>Django</span>
                        </a>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SupportLayout>
  );
};
