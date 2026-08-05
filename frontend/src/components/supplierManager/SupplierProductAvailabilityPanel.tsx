import React, { useState } from 'react';
import { X, Search, Building2, Star, Loader2, AlertCircle } from 'lucide-react';
import type { SupplierManagerMissingItem } from '../../types/supplierManager.types';

interface SupplierProductAvailabilityPanelProps {
  cod_producto: number | null;
  nombreProducto: string;
  onClose: () => void;
  onFetchMissing: (cod_producto: number, cantidad?: number) => Promise<SupplierManagerMissingItem[]>;
}

export const SupplierProductAvailabilityPanel: React.FC<SupplierProductAvailabilityPanelProps> = ({
  cod_producto,
  nombreProducto,
  onClose,
  onFetchMissing,
}) => {
  const [cantidad, setCantidad] = useState(10);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<SupplierManagerMissingItem[] | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!cod_producto) return null;

  const handleQuery = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    try {
      const provs = await onFetchMissing(cod_producto, cantidad);
      setResults(provs);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'No se pudo consultar proveedores en BD');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ops-drawer-overlay" onClick={onClose}>
      <div className="ops-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ops-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Search size={20} color="#3b82f6" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
              Consulta DB-First de Proveedores
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="ops-drawer-body">
          <div style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #1f2937' }}>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8', textTransform: 'uppercase' }}>
              PRODUCTO / SKU REQUERIDO
            </span>
            <h4 style={{ margin: '0.4rem 0 0', fontSize: '1.15rem', color: '#f8fafc' }}>
              {nombreProducto} (ID #{cod_producto})
            </h4>
          </div>

          <form
            onSubmit={handleQuery}
            style={{ background: '#0f172a', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #334155' }}
          >
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#cbd5e1', marginBottom: '0.4rem' }}>
              Cantidad o Lote Requerido para Abastecimiento:
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="number"
                min="1"
                value={cantidad}
                onChange={(e) => setCantidad(Number(e.target.value) || 1)}
                className="ops-filter-input"
                style={{ flex: 1 }}
              />
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: '0.55rem 1.25rem',
                  borderRadius: '0.5rem',
                  background: '#3b82f6',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                <span>Consultar BD</span>
              </button>
            </div>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: '#94a3b8' }}>
              Consulta en tiempo real a /proveedores/api/producto/id/faltante/ (escala de precios y saldos en almacén de proveedor).
            </p>
          </form>

          {errorMsg && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.85rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {results && (
            <div>
              <h5 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#e2e8f0' }}>
                Proveedores Habilitados y Capacidad ({results.length}):
              </h5>

              {results.length === 0 ? (
                <div style={{ background: '#0f172a', padding: '2rem', textAlign: 'center', borderRadius: '0.5rem', color: '#94a3b8' }}>
                  Ningún proveedor con stock suficiente registrado en la base de datos para esta cantidad.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {results.map((prov) => (
                    <div
                      key={prov.cod_proveedor}
                      style={{
                        background: '#0f172a',
                        border: '1px solid #334155',
                        borderRadius: '0.65rem',
                        padding: '1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Building2 size={16} color="#60a5fa" />
                          <strong style={{ color: '#f8fafc', fontSize: '1rem' }}>
                            {prov.razon_social}
                          </strong>
                        </div>
                        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.35rem', fontSize: '0.85rem', color: '#94a3b8' }}>
                          <span>
                            Costo Unitario: <strong style={{ color: '#10b981' }}>{prov.costo_unitario}</strong>
                          </span>
                          <span>
                            Stock Disp: <strong style={{ color: '#38bdf8' }}>{prov.stock_disponible}</strong>
                          </span>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <span style={{ background: '#1e293b', color: '#fbbf24', padding: '0.25rem 0.6rem', borderRadius: '9999px', fontWeight: 600, fontSize: '0.75rem' }}>
                          {prov.tiempo_entrega_dias} días entrega
                        </span>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.25rem', color: '#fbbf24', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                          <Star size={13} fill="#fbbf24" />
                          <span>{prov.calificacion}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="ops-drawer-footer">
          <button
            onClick={onClose}
            style={{
              padding: '0.6rem 1.25rem',
              borderRadius: '0.5rem',
              background: '#334155',
              color: '#f8fafc',
              border: 'none',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
