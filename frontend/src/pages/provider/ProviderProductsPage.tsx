import React, { useState, useMemo } from 'react';
import { ProviderLayout } from '../../components/provider/ProviderLayout';
import { useProviderPortal } from '../../hooks/useProviderPortal';
import { ProviderFilters } from '../../components/provider/ProviderFilters';
import { ProviderProductDetailModal } from '../../components/provider/ProviderProductDetailModal';
import { Package, AlertTriangle, CheckCircle2, RefreshCw, Edit3, ExternalLink } from 'lucide-react';
import type { ProviderProductItem } from '../../types/provider.types';

export const ProviderProductsPage: React.FC = () => {
  const { proveedor, productos, loading, error, actionLoading, handleUpdateStock, reload } = useProviderPortal();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<ProviderProductItem | null>(null);
  const [mensajeOk, setMensajeOk] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    return productos.filter((p) => {
      const matchesSearch =
        p.producto.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.sku_proveedor && p.sku_proveedor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        String(p.cod_producto_proveedor).includes(searchTerm);
      const isActivo = p.activo !== false;
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
    <ProviderLayout title="Mis Productos y Control de Stock" razonSocial={proveedor?.razon_social}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--tt-color-text-main)' }}>
            Actualizar Disponibilidad DB-First en Catálogo
          </h2>
          <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>
            Ajusta tu stock disponible para que el sistema TechTail pueda emitir nuevas órdenes
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <a
            href="/proveedores/"
            target="_blank"
            rel="noreferrer"
            className="tt-btn tt-btn--secondary"
            style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.85rem', textDecoration: 'none', color: 'var(--tt-color-primary)' }}
            title="Abrir portal histórico de proveedores en Django"
          >
            <span>Portal /proveedores/</span>
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

      <ProviderFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        statusOptions={['TODOS', 'ACTIVO', 'INACTIVO']}
        onReset={() => {
          setSearchTerm('');
          setSelectedStatus('');
        }}
        placeholder="Buscar por nombre de producto, SKU propio o código..."
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
            <Package size={18} color="var(--tt-color-primary)" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
              Mis SKUs y Saldos en Almacén ({filteredProducts.length})
            </h3>
          </div>
        </div>

        <div className="ops-table-container">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Referencia</th>
                <th>SKU Proveedor</th>
                <th>Nombre del Producto</th>
                <th>Costo Unit. (Pactado)</th>
                <th>Plazo Entrega (SLA)</th>
                <th>Stock Disp. Oficial</th>
                <th>Estado BD</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--tt-color-text-light)' }}>
                    Consultando inventario en PostgreSQL vía /proveedores/api/mi-panel/...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--tt-color-text-light)' }}>
                    No se encontraron productos en el catálogo comercial del proveedor
                  </td>
                </tr>
              ) : (
                filteredProducts.map((prod) => (
                  <tr key={prod.cod_producto_proveedor}>
                    <td style={{ color: 'var(--tt-color-text-light)', fontWeight: 600 }}>
                      #{prod.cod_producto_proveedor}
                    </td>
                    <td style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--tt-color-warning)' }}>
                      {prod.sku_proveedor || `SKU-${prod.cod_producto_proveedor}`}
                    </td>
                    <td style={{ fontWeight: 600 }}>{prod.producto}</td>
                    <td style={{ fontWeight: 700, color: 'var(--tt-color-success)' }}>{prod.costo_unitario}</td>
                    <td>{prod.tiempo_entrega_dias} días</td>
                    <td>
                      <span
                        style={{
                          fontSize: '1.05rem',
                          fontWeight: 700,
                          color: (prod.stock_disponible || 0) <= 5 ? 'var(--tt-color-error)' : 'var(--tt-color-primary)',
                        }}
                      >
                        {prod.stock_disponible}
                      </span>
                    </td>
                    <td>
                      <span className={`ops-badge ${prod.activo ? 'ops-badge--ok' : 'ops-badge--critica'}`}>
                        {prod.activo ? 'ACTIVO' : 'INACTIVO'}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelectedProduct(prod)}
                        className="tt-btn tt-btn--secondary"
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.35rem', color: 'var(--tt-color-primary)', borderColor: 'var(--tt-color-primary-hover)' }}
                        title="Modificar stock disponible del proveedor en modal DB-First"
                      >
                        <Edit3 size={13} />
                        <span>Actualizar Stock</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ProviderProductDetailModal
        product={selectedProduct}
        loading={actionLoading}
        onClose={() => setSelectedProduct(null)}
        onUpdateStock={async (cod, cant) => {
          const res = await handleUpdateStock(cod, cant);
          setMensajeOk(`Inventario oficial en PostgreSQL del producto #${cod} actualizado a ${cant} unidades.`);
          return res;
        }}
        onSuccess={() => {
          reload();
        }}
      />
    </ProviderLayout>
  );
};
