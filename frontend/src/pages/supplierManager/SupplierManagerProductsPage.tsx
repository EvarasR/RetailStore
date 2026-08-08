import React, { useState, useMemo } from 'react';
import { SupplierManagerLayout } from '../../components/supplierManager/SupplierManagerLayout';
import { useSupplierManager } from '../../hooks/useSupplierManager';
import { SupplierManagerFilters } from '../../components/supplierManager/SupplierManagerFilters';
import { SupplierProductAvailabilityPanel } from '../../components/supplierManager/SupplierProductAvailabilityPanel';
import { Package, AlertTriangle, RefreshCw, SearchCheck } from 'lucide-react';

export const SupplierManagerProductsPage: React.FC = () => {
  const { productos, loading, error, reload, loadMissingForProduct } = useSupplierManager();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<{ id: number; nombre: string } | null>(null);

  const filteredProducts = useMemo(() => {
    return productos.filter((pd) => {
      const matchesSearch =
        pd.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (pd.sku && pd.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pd.proveedor && pd.proveedor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        String(pd.cod_producto || pd.cod_producto_proveedor).includes(searchTerm);
      const isActivo = pd.activo !== false;
      const matchesStatus =
        selectedStatus === 'ACTIVO'
          ? isActivo
          : selectedStatus === 'INACTIVO'
          ? !isActivo
          : true;
      return matchesSearch && matchesStatus;
    });
  }, [productos, searchTerm, selectedStatus]);

  return (
    <SupplierManagerLayout title="Catálogo de Costos por Proveedor">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--tt-color-text-main)' }}>
            SKUs Asociados y Condiciones Comerciales
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>
            Relaciones producto-proveedor, costos unitarios y consulta de saldos para reabastecimiento
          </p>
        </div>

        <button
          onClick={reload}
          disabled={loading}
          className="tt-btn tt-btn--secondary"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem' }}
        >
          <RefreshCw size={15} />
          <span>Actualizar SKUs</span>
        </button>
      </div>

      <SupplierManagerFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        statusOptions={['TODOS', 'ACTIVO', 'INACTIVO']}
        onReset={() => {
          setSearchTerm('');
          setSelectedStatus('');
        }}
        placeholder="Buscar por producto, SKU, razón social o código..."
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
            <Package size={18} color="var(--tt-color-primary)" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
              Relaciones de Suministro ({filteredProducts.length})
            </h3>
          </div>
        </div>

        <div className="ops-table-container">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Referencia</th>
                <th>SKU</th>
                <th>Nombre del Producto</th>
                <th>Proveedor Asociado</th>
                <th>Costo Unitario</th>
                <th>Entrega Estimada</th>
                <th>Stock Disp. Proveedor</th>
                <th>Estado BD</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--tt-color-text-light)' }}>
                    Cargando catálogo comercial desde PostgreSQL...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--tt-color-text-light)' }}>
                    No se encontraron SKUs asociados a proveedores con los filtros actuales
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod.cod_producto_proveedor || prod.cod_producto}>
                    <td style={{ color: 'var(--tt-color-text-light)' }}>
                      #{prod.cod_producto_proveedor || prod.cod_producto}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>
                      {prod.sku || 'N/D'}
                    </td>
                    <td style={{ fontWeight: 600 }}>{prod.producto}</td>
                    <td>{prod.proveedor || 'Proveedor Corporativo'}</td>
                    <td style={{ fontWeight: 700, color: 'var(--tt-color-success)' }}>
                      {prod.costo_unitario || '$0.00'}
                    </td>
                    <td>{prod.tiempo_entrega_dias || 3} días</td>
                    <td style={{ fontWeight: 700, color: (prod.stock_disponible || 0) <= 5 ? 'var(--tt-color-error)' : 'var(--tt-color-primary)' }}>
                      {prod.stock_disponible || 0} unid.
                    </td>
                    <td>
                      <span className={`ops-badge ${prod.activo !== false ? 'ops-badge--ok' : 'ops-badge--critica'}`}>
                        {prod.activo !== false ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() =>
                          setSelectedProduct({
                            id: prod.cod_producto || prod.cod_producto_proveedor || 1,
                            nombre: prod.producto,
                          })
                        }
                        className="tt-btn tt-btn--secondary"
                        style={{ padding: '0.25rem 0.55rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem', color: 'var(--tt-color-primary)', borderColor: 'var(--tt-color-primary-hover)' }}
                        title="Consultar disponibilidad por volumen en BD (/proveedores/api/producto/id/faltante/)"
                      >
                        <SearchCheck size={13} />
                        <span>Faltantes / Vol.</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <SupplierProductAvailabilityPanel
        cod_producto={selectedProduct?.id || null}
        nombreProducto={selectedProduct?.nombre || ''}
        onClose={() => setSelectedProduct(null)}
        onFetchMissing={loadMissingForProduct}
      />
    </SupplierManagerLayout>
  );
};
