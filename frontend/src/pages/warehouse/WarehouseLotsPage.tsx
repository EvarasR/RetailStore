import React, { useState, useMemo } from 'react';
import { WarehouseLayout } from '../../components/warehouse/WarehouseLayout';
import { useWarehouse } from '../../hooks/useWarehouse';
import { WarehouseFilters } from '../../components/warehouse/WarehouseFilters';
import { WarehouseLotDetailDrawer } from '../../components/warehouse/WarehouseLotDetailDrawer';
import { Layers, AlertTriangle, RefreshCw, Eye } from 'lucide-react';
import type { WarehouseLotItem } from '../../types/warehouse.types';

export const WarehouseLotsPage: React.FC = () => {
  const { lotes, loading, error, reload } = useWarehouse();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlmacen, setSelectedAlmacen] = useState('');
  const [selectedLot, setSelectedLot] = useState<WarehouseLotItem | null>(null);

  const almacenesDisponibles = useMemo(() => {
    const set = new Set<string>();
    lotes.forEach((l) => set.add(l.almacen || 'Principal'));
    return Array.from(set);
  }, [lotes]);

  const filteredLots = useMemo(() => {
    return lotes.filter((lt) => {
      const matchesSearch =
        (lt.producto && lt.producto.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (lt.codigo_lote && lt.codigo_lote.toLowerCase().includes(searchTerm.toLowerCase())) ||
        String(lt.id || lt.cod_lote).includes(searchTerm);
      const matchesAlmacen = selectedAlmacen ? (lt.almacen || 'Principal') === selectedAlmacen : true;
      return matchesSearch && matchesAlmacen;
    });
  }, [lotes, searchTerm, selectedAlmacen]);

  return (
    <WarehouseLayout title="Gestión de Lotes y Vencimientos">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--tt-color-text-main)' }}>
            Lotes Activos y Rotación FIFO
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>
            Monitoreo DB-First de lotes de ingreso, existencias disponibles y fechas de vencimiento
          </p>
        </div>

        <button
          onClick={reload}
          disabled={loading}
          className="tt-btn tt-btn--secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
        >
          <RefreshCw size={15} />
          <span>Actualizar BD</span>
        </button>
      </div>

      <WarehouseFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedAlmacen={selectedAlmacen}
        onAlmacenChange={setSelectedAlmacen}
        almacenesDisponibles={almacenesDisponibles}
        selectedEstado=""
        onEstadoChange={() => {}}
        estadosDisponibles={[]}
        onReset={() => {
          setSearchTerm('');
          setSelectedAlmacen('');
        }}
        placeholder="Buscar por código de lote, producto o ID..."
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
            <Layers size={18} color="var(--tt-color-warning)" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
              Registro de Lotes de Almacén ({filteredLots.length})
            </h3>
          </div>
        </div>

        <div className="ops-table-container">
          <table className="ops-table">
            <thead>
              <tr>
                <th>ID Lote</th>
                <th>Código Lote</th>
                <th>Producto Asignado</th>
                <th>Almacén</th>
                <th>Cantidad</th>
                <th>Recepción</th>
                <th>Vencimiento</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--tt-color-text-light)' }}>
                    Cargando lotes registrados en PostgreSQL...
                  </td>
                </tr>
              ) : filteredLots.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--tt-color-text-light)' }}>
                    No se encontraron lotes de almacén con los filtros aplicados
                  </td>
                </tr>
              ) : (
                filteredLots.map((lt, idx) => (
                  <tr key={lt.id || lt.cod_lote || idx}>
                    <td style={{ color: 'var(--tt-color-text-light)' }}>#{lt.id || lt.cod_lote || idx + 1}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--tt-color-warning)' }}>
                      {lt.codigo_lote || `LOTE-${idx + 1}`}
                    </td>
                    <td style={{ fontWeight: 600 }}>{lt.producto}</td>
                    <td>{lt.almacen || 'Principal'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--tt-color-primary)' }}>{lt.cantidad}</td>
                    <td style={{ color: 'var(--tt-color-text-muted)' }}>{lt.fecha_recepcion || 'N/A'}</td>
                    <td style={{ color: lt.fecha_vencimiento ? 'var(--tt-color-text-main)' : 'var(--tt-color-text-light)' }}>
                      {lt.fecha_vencimiento || 'Sin caducidad'}
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedLot(lt)}
                        className="tt-btn tt-btn--secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                        title="Ver detalle del lote"
                      >
                        <Eye size={13} />
                        <span>Trazabilidad</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <WarehouseLotDetailDrawer
        lote={selectedLot}
        onClose={() => setSelectedLot(null)}
      />
    </WarehouseLayout>
  );
};
