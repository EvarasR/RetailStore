import React, { useState } from 'react';
import { ProviderLayout } from '../../components/provider/ProviderLayout';
import { useProviderPortal } from '../../hooks/useProviderPortal';
import { History, Search, AlertTriangle, RefreshCw } from 'lucide-react';

export const ProviderHistoryPage: React.FC = () => {
  const { proveedor, historial, loading, error, reload } = useProviderPortal();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistory = historial.filter((h) => {
    return (
      (h.evento && h.evento.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (h.descripcion && h.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <ProviderLayout title="Historial y Relación Comercial" razonSocial={proveedor?.razon_social}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>
            Registro Completo de Auditoría y Eventos
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
            Trazabilidad DB-First de contratos, entregas anteriores y renovaciones
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative' }}>
            <Search
              size={16}
              color="#94a3b8"
              style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)' }}
            />
            <input
              type="text"
              placeholder="Buscar evento o detalle..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="tt-input"
              style={{ paddingLeft: '2.25rem', width: '250px' }}
            />
          </div>

          <button
            onClick={reload}
            disabled={loading}
            className="tt-btn tt-btn--secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
          >
            <RefreshCw size={15} />
            <span>Refrescar</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="tt-alert tt-alert--error" style={{ marginBottom: '1.25rem' }}>
          <AlertTriangle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="prov-table-box">
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #1e293b', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <History size={18} color="#a855f7" />
          <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
            Bitácora de Eventos ({filteredHistory.length})
          </h3>
        </div>

        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Evento / Tipo</th>
              <th>Detalle del Registro</th>
              <th>Fecha del Evento</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  Cargando bitácora comercial...
                </td>
              </tr>
            ) : filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                  No se encontraron eventos comerciales recientes
                </td>
              </tr>
            ) : (
              filteredHistory.map((hs, idx) => (
                <tr key={idx}>
                  <td style={{ color: '#94a3b8' }}>#{idx + 1}</td>
                  <td style={{ fontWeight: 700, color: '#a855f7' }}>
                    {hs.evento || 'RECEPCIÓN OK'}
                  </td>
                  <td>{hs.descripcion}</td>
                  <td style={{ fontSize: '0.85rem' }}>{hs.fecha || 'Hoy'}</td>
                  <td>
                    <span className="ops-badge ops-badge--ok">COMPLETADO</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </ProviderLayout>
  );
};
