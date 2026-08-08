import React, { useState, useMemo } from 'react';
import { WarehouseLayout } from '../../components/warehouse/WarehouseLayout';
import { useWarehouse } from '../../hooks/useWarehouse';
import { WarehouseFilters } from '../../components/warehouse/WarehouseFilters';
import { WarehouseInventoryDetailDrawer } from '../../components/warehouse/WarehouseInventoryDetailDrawer';
import { PackageCheck, AlertTriangle, CheckCircle2, Eye, RefreshCw } from 'lucide-react';
import type { WarehouseProductItem } from '../../types/warehouse.types';

export const WarehouseInventoryPage: React.FC = () => {
  const { productos, loading, error, actionLoading, handleAction, reload } = useWarehouse();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlmacen, setSelectedAlmacen] = useState('');
  const [selectedEstado, setSelectedEstado] = useState('');
  const [mensajeOk, setMensajeOk] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<WarehouseProductItem | null>(null);

  const almacenesDisponibles = useMemo(() => {
    const set = new Set<string>();
    productos.forEach((p) => set.add(p.almacen || 'Principal'));
    return Array.from(set);
  }, [productos]);

  const filteredProducts = useMemo(() => {
    return productos.filter((p) => {
      const matchesSearch =
        p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku && p.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        String(p.cod_producto).includes(searchTerm);
      const matchesAlmacen = selectedAlmacen ? (p.almacen || 'Principal') === selectedAlmacen : true;
      const matchesEstado = selectedEstado ? p.estado === selectedEstado : true;
      return matchesSearch && matchesAlmacen && matchesEstado;
    });
  }, [productos, searchTerm, selectedAlmacen, selectedEstado]);

  const onTriggerAction = async (accion: string, cod_producto: number) => {
    setMensajeOk(null);
    try {
      const res = await handleAction(accion, cod_producto);
      setMensajeOk(res.mensaje || `Acción '${accion}' ejecutada y reflejada en base de datos`);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Fallo en la acción de inventario');
    }
  };

  return (
    <WarehouseLayout title="Inventario Operativo de Almacén">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--tt-color-text-main)' }}>
            Control y Existencias de SKUs
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>
            Consulta DB-First, auditoría de existencias y detalle oficial en PostgreSQL
          </p>
        </div>

        <button
          onClick={reload}
          disabled={loading}
          className="tt-btn tt-btn--secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}
        >
          <RefreshCw size={15} />
          <span>Actualizar Stock BD</span>
        </button>
      </div>

      <WarehouseFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedAlmacen={selectedAlmacen}
        onAlmacenChange={setSelectedAlmacen}
        almacenesDisponibles={almacenesDisponibles}
        selectedEstado={selectedEstado}
        onEstadoChange={setSelectedEstado}
        estadosDisponibles={['TODOS', 'NORMAL', 'STOCK_CRITICO', 'SIN_STOCK']}
        onReset={() => {
          setSearchTerm('');
          setSelectedAlmacen('');
          setSelectedEstado('');
        }}
        placeholder="Buscar por SKU, producto o código..."
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
            <PackageCheck size={18} color="var(--tt-color-primary)" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
              Lista Oficial de Productos en Almacén ({filteredProducts.length})
            </h3>
          </div>
        </div>

        <div className="ops-table-container">
          <table className="ops-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>SKU</th>
                <th>Nombre del Producto</th>
                <th>Almacén</th>
                <th>Stock Disp.</th>
                <th>Reservado</th>
                <th>Stock Mín.</th>
                <th>Estado BD</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--tt-color-text-light)' }}>
                    Cargando inventario físico DB-First...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--tt-color-text-light)' }}>
                    No se encontraron productos en almacén con los filtros actuales
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod.cod_producto}>
                    <td style={{ color: 'var(--tt-color-text-light)' }}>#{prod.cod_producto}</td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {prod.sku || `SKU-${prod.cod_producto}`}
                    </td>
                    <td style={{ fontWeight: 600 }}>{prod.nombre}</td>
                    <td>{prod.almacen || 'Principal'}</td>
                    <td style={{ fontWeight: 700, color: prod.stock_disponible <= (prod.stock_minimo || 5) ? 'var(--tt-color-error)' : 'var(--tt-color-success)' }}>
                      {prod.stock_disponible}
                    </td>
                    <td style={{ color: 'var(--tt-color-text-light)' }}>{prod.stock_reservado || 0}</td>
                    <td style={{ color: 'var(--tt-color-text-light)' }}>{prod.stock_minimo || 5}</td>
                    <td>
                      <span
                        className={
                          prod.estado === 'SIN_STOCK'
                            ? 'ops-badge ops-badge--critica'
                            : prod.estado === 'STOCK_CRITICO'
                            ? 'ops-badge ops-badge--media'
                            : 'ops-badge ops-badge--ok'
                        }
                      >
                        {prod.estado}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.4rem' }}>
                        <button
                          onClick={() => setSelectedProduct(prod)}
                          className="tt-btn tt-btn--secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}
                          title="Ver desglose y umbral en BD"
                        >
                          <Eye size={13} />
                          <span>Detalle</span>
                        </button>
                        <button
                          onClick={() => onTriggerAction('auditar_stock', prod.cod_producto)}
                          disabled={actionLoading}
                          className="tt-btn tt-btn--secondary"
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          title="Ejecutar auditoría de stock en BD"
                        >
                          Auditar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <WarehouseInventoryDetailDrawer
        item={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </WarehouseLayout>
  );
};
