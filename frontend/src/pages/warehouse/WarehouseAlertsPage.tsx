import React, { useState, useMemo } from 'react';
import { WarehouseLayout } from '../../components/warehouse/WarehouseLayout';
import { useWarehouse } from '../../hooks/useWarehouse';
import { WarehouseFilters } from '../../components/warehouse/WarehouseFilters';
import { WarehouseAlertActions } from '../../components/warehouse/WarehouseAlertActions';
import { AlertTriangle, CheckCircle2, RefreshCw, CheckSquare } from 'lucide-react';
import type { WarehouseAlertItem } from '../../types/warehouse.types';

export const WarehouseAlertsPage: React.FC = () => {
  const { alertas, loading, error, actionLoading, handleResolveAlert, reload } = useWarehouse();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSeveridad, setSelectedSeveridad] = useState('');
  const [mensajeOk, setMensajeOk] = useState<string | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<WarehouseAlertItem | null>(null);

  const filteredAlerts = useMemo(() => {
    return alertas.filter((alt) => {
      const matchesSearch =
        alt.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alt.tipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(alt.id || alt.cod_alerta).includes(searchTerm);
      const matchesAlmacen = true;
      const matchesSev = selectedSeveridad ? alt.severidad === selectedSeveridad : true;
      return matchesSearch && matchesAlmacen && matchesSev;
    });
  }, [alertas, searchTerm, selectedSeveridad]);

  return (
    <WarehouseLayout title="Alertas Operativas de Inventario">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>
            Notificaciones de Umbrales y Quiebre de Stock
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
            Monitoreo en tiempo real de niveles mínimos y alertas operativas generadas por PostgreSQL
          </p>
        </div>

        <button
          onClick={reload}
          disabled={loading}
          className="tt-btn tt-btn--secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
        >
          <RefreshCw size={15} />
          <span>Actualizar Alertas</span>
        </button>
      </div>

      <WarehouseFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedAlmacen=""
        onAlmacenChange={() => {}}
        almacenesDisponibles={[]}
        selectedEstado={selectedSeveridad}
        onEstadoChange={setSelectedSeveridad}
        estadosDisponibles={['TODOS', 'CRITICA', 'ALTA', 'MEDIA', 'BAJA']}
        onReset={() => {
          setSearchTerm('');
          setSelectedSeveridad('');
        }}
        placeholder="Buscar por producto, tipo o ID de alerta..."
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
            <AlertTriangle size={18} color="#ef4444" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
              Bitácora de Alertas Pendientes de Bodega ({filteredAlerts.length})
            </h3>
          </div>
        </div>

        <div className="ops-table-container">
          <table className="ops-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Tipo de Alerta</th>
                <th>Severidad</th>
                <th>SKU Asignado</th>
                <th>Almacén</th>
                <th>Estado BD</th>
                <th>Fecha Generación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    Cargando alertas de almacén registradas en el servidor...
                  </td>
                </tr>
              ) : filteredAlerts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    No se detectaron alertas operativas pendientes en el sistema
                  </td>
                </tr>
              ) : (
                filteredAlerts.map((alt) => (
                  <tr key={alt.id || alt.cod_alerta}>
                    <td style={{ color: '#94a3b8' }}>#{alt.id || alt.cod_alerta}</td>
                    <td style={{ fontWeight: 700, color: '#f8fafc' }}>{alt.tipo}</td>
                    <td>
                      <span
                        className={
                          alt.severidad === 'CRITICA' || alt.severidad === 'ALTA'
                            ? 'ops-badge ops-badge--critica'
                            : alt.severidad === 'MEDIA'
                            ? 'ops-badge ops-badge--media'
                            : 'ops-badge ops-badge--ok'
                        }
                      >
                        {alt.severidad}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{alt.producto}</td>
                    <td>{alt.almacen || 'Principal'}</td>
                    <td>
                      <span className="ops-badge ops-badge--media">{alt.estado}</span>
                    </td>
                    <td style={{ color: '#cbd5e1' }}>{alt.fecha || 'Reciente'}</td>
                    <td>
                      <button
                        onClick={() => setSelectedAlert(alt)}
                        disabled={actionLoading}
                        className="tt-btn tt-btn--secondary"
                        style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', borderColor: '#047857' }}
                        title="Atender y resolver alerta con nota logística"
                      >
                        <CheckSquare size={13} />
                        <span>Resolver Alerta</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <WarehouseAlertActions
        alerta={selectedAlert}
        loading={actionLoading}
        onClose={() => setSelectedAlert(null)}
        onResolve={async (cod_alerta, obs) => {
          const res = await handleResolveAlert(cod_alerta, obs);
          setMensajeOk('Alerta resuelta en base de datos correctamente.');
          return res;
        }}
      />
    </WarehouseLayout>
  );
};
