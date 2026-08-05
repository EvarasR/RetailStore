import React, { useState } from 'react';
import { SupplierManagerLayout } from '../../components/supplierManager/SupplierManagerLayout';
import { useSupplierManager } from '../../hooks/useSupplierManager';
import { AlertCircle, Search, AlertTriangle, Truck } from 'lucide-react';

export const SupplierManagerMissingPage: React.FC = () => {
  const { productos, missingSuppliers, searchingMissing, loadMissingForProduct } = useSupplierManager();
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [cantidadReq, setCantidadReq] = useState(10);
  const [errorBusqueda, setErrorBusqueda] = useState<string | null>(null);

  // Filtramos los productos con stock bajo o tomamos la lista para seleccionar
  const onBuscarFaltante = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId) return;
    setErrorBusqueda(null);
    try {
      await loadMissingForProduct(selectedProductId, Number(cantidadReq) || 1);
    } catch (err: unknown) {
      setErrorBusqueda(err instanceof Error ? err.message : 'Error en consulta de proveedores');
    }
  };

  return (
    <SupplierManagerLayout title="Asignación para Faltantes de Stock">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>
          Consultar Proveedores con Disponibilidad
        </h2>
        <p style={{ margin: '0.25rem 0 0', fontSize: '0.85rem', color: '#94a3b8' }}>
          Busca en tiempo real qué proveedores disponen del SKU requerido usando el endpoint de faltante
        </p>
      </div>

      <div className="ops-metric-card" style={{ marginBottom: '1.75rem', padding: '1.5rem' }}>
        <form onSubmit={onBuscarFaltante} style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: '1 1 240px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 600 }}>
              Seleccionar Producto
            </label>
            <select
              value={selectedProductId || ''}
              onChange={(e) => setSelectedProductId(Number(e.target.value))}
              className="tt-input"
              style={{ width: '100%' }}
              required
            >
              <option value="">-- Elige un producto --</option>
              {productos.map((p, idx) => (
                <option key={p.cod_producto || idx} value={p.cod_producto || idx + 1}>
                  {p.producto} {p.sku ? `(${p.sku})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div style={{ width: '150px' }}>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#cbd5e1', marginBottom: '0.4rem', fontWeight: 600 }}>
              Cantidad Req.
            </label>
            <input
              type="number"
              min="1"
              value={cantidadReq}
              onChange={(e) => setCantidadReq(Number(e.target.value))}
              className="tt-input"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={searchingMissing || !selectedProductId}
              className="tt-btn tt-btn--primary"
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', height: '42px' }}
            >
              <Search size={16} />
              <span>{searchingMissing ? 'Consultando...' : 'Buscar Proveedor'}</span>
            </button>
          </div>
        </form>
      </div>

      {errorBusqueda && (
        <div className="tt-alert tt-alert--error" style={{ marginBottom: '1.25rem' }}>
          <AlertTriangle size={18} />
          <span>{errorBusqueda}</span>
        </div>
      )}

      <div className="ops-table-card">
        <div className="ops-table-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={18} color="#f59e0b" />
            <h3 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700 }}>
              Proveedores Recomendados ({missingSuppliers.length})
            </h3>
          </div>
        </div>

        <div className="ops-table-container">
          <table className="ops-table">
            <thead>
              <tr>
                <th>Razón Social</th>
                <th>Calificación</th>
                <th>Costo Unitario</th>
                <th>Plazo de Entrega</th>
                <th>Stock Disp. en Proveedor</th>
                <th>Acción Rápida</th>
              </tr>
            </thead>
            <tbody>
              {searchingMissing ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    Consultando costos y plazos en proveedores...
                  </td>
                </tr>
              ) : missingSuppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                    Selecciona un producto y presiona 'Buscar Proveedor' para ver disponibilidad
                  </td>
                </tr>
              ) : (
                missingSuppliers.map((sup, idx) => (
                  <tr key={sup.cod_proveedor || idx}>
                    <td style={{ fontWeight: 700, color: '#f8fafc' }}>{sup.razon_social}</td>
                    <td>
                      <span className="ops-badge ops-badge--ok">{sup.calificacion || '4.8'} ⭐</span>
                    </td>
                    <td style={{ fontWeight: 700, color: '#10b981' }}>
                      ${sup.costo_unitario || '0.00'}
                    </td>
                    <td>{sup.tiempo_entrega_dias || 3} días</td>
                    <td style={{ fontWeight: 700 }}>{sup.stock_disponible || '100+'}</td>
                    <td>
                      <a
                        href="/panel/"
                        target="_blank"
                        rel="noreferrer"
                        className="tt-btn tt-btn--secondary"
                        style={{ padding: '0.3rem 0.65rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem', textDecoration: 'none', color: '#60a5fa' }}
                        title="Crear orden de abastecimiento en panel Django"
                      >
                        <Truck size={14} />
                        <span>Orden en /panel/</span>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </SupplierManagerLayout>
  );
};
