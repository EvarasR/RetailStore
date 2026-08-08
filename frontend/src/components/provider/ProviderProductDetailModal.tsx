import React, { useState, useEffect } from 'react';
import { X, Package, CheckCircle2, AlertTriangle, Loader2, Save, ExternalLink } from 'lucide-react';
import type { ProviderProductItem } from '../../types/provider.types';

interface ProviderProductDetailModalProps {
  product: ProviderProductItem | null;
  loading: boolean;
  onClose: () => void;
  onUpdateStock: (cod_producto_proveedor: number, cantidad: number) => Promise<unknown>;
  onSuccess?: () => void;
}

export const ProviderProductDetailModal: React.FC<ProviderProductDetailModalProps> = ({
  product,
  loading,
  onClose,
  onUpdateStock,
  onSuccess,
}) => {
  const [stockVal, setStockVal] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (product) {
      setStockVal(product.stock_disponible || 0);
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [product]);

  if (!product) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (stockVal < 0) {
      setErrorMsg('El stock no puede ser un valor negativo.');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await onUpdateStock(product.cod_producto_proveedor, Number(stockVal));
      setSuccessMsg(`Inventario oficial en PostgreSQL actualizado a ${stockVal} unidades.`);
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const txt = err instanceof Error ? err.message : 'Error actualizando stock del proveedor';
      setErrorMsg(txt);
    }
  };

  return (
    <div className="ops-modal-overlay" onClick={onClose}>
      <div
        className="ops-modal-panel"
        style={{ maxWidth: '520px', width: '100%' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ops-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <Package size={20} color="var(--tt-color-primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--tt-color-text-main)' }}>
              Ajuste DB-First de Stock de Proveedor
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--tt-color-text-light)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="ops-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ background: 'var(--tt-color-text-main)', padding: '1rem', borderRadius: '0.65rem', border: '1px solid var(--tt-color-border-dark)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)', textTransform: 'uppercase' }}>
                SKU PROPIO: {product.sku_proveedor || `SKU-${product.cod_producto_proveedor}`}
              </span>
              <span className={`ops-badge ${product.activo ? 'ops-badge--ok' : 'ops-badge--critica'}`}>
                {product.activo ? 'ACTIVO COMERCIAL' : 'INACTIVO'}
              </span>
            </div>
            <h4 style={{ margin: '0.35rem 0 0', fontSize: '1.15rem', color: 'var(--tt-color-text-main)' }}>
              {product.producto}
            </h4>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
            <div style={{ background: 'var(--tt-color-text-main)', padding: '0.85rem', borderRadius: '0.65rem', border: '1px solid var(--tt-color-surface-subtle)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--tt-color-text-light)' }}>Costo Unitario Pactado</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--tt-color-success)', marginTop: '0.2rem' }}>
                {product.costo_unitario}
              </div>
            </div>
            <div style={{ background: 'var(--tt-color-text-main)', padding: '0.85rem', borderRadius: '0.65rem', border: '1px solid var(--tt-color-surface-subtle)' }}>
              <span style={{ fontSize: '0.8rem', color: 'var(--tt-color-text-light)' }}>Tiempo de Entrega (SLA)</span>
              <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--tt-color-warning)', marginTop: '0.2rem' }}>
                {product.tiempo_entrega_dias} días
              </div>
            </div>
          </div>

          {errorMsg && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid var(--tt-color-error)', color: 'var(--tt-color-error)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertTriangle size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid var(--tt-color-success)', color: 'var(--tt-color-success)', padding: '0.75rem', borderRadius: '0.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CheckCircle2 size={16} />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ background: 'var(--tt-color-text-main)', padding: '1rem', borderRadius: '0.65rem', border: '1px solid var(--tt-color-primary)' }}>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--tt-color-text-muted)', marginBottom: '0.4rem', fontWeight: 600 }}>
              Inventario Disponible en Bodega del Proveedor:
            </label>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <input
                type="number"
                min="0"
                value={stockVal}
                onChange={(e) => setStockVal(Number(e.target.value))}
                disabled={loading}
                className="ops-filter-input"
                style={{ flex: 1, fontSize: '1.1rem', fontWeight: 700 }}
              />
              <button
                type="submit"
                disabled={loading || stockVal === product.stock_disponible}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '0.5rem',
                  background: loading || stockVal === product.stock_disponible ? '#475569' : 'var(--tt-color-primary)',
                  color: '#ffffff',
                  border: 'none',
                  fontWeight: 600,
                  cursor: loading || stockVal === product.stock_disponible ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                <Save size={16} />
                <span>Guardar en BD</span>
              </button>
            </div>
            <p style={{ margin: '0.5rem 0 0', fontSize: '0.75rem', color: 'var(--tt-color-text-light)' }}>
              Envía la actualización directa a PostgreSQL vía POST /proveedores/api/stock/actualizar/.
            </p>
          </form>

          <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid var(--tt-color-surface-subtle)', padding: '0.85rem', borderRadius: '0.65rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ color: 'var(--tt-color-text-main)', fontSize: '0.85rem', display: 'block' }}>
                ¿Necesitas cambiar costo o SLA de entrega?
              </strong>
              <span style={{ fontSize: '0.75rem', color: 'var(--tt-color-text-light)' }}>
                Los precios de contrato y condiciones se administran en el portal corporativo.
              </span>
            </div>
            <a
              href="/proveedores/"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                color: 'var(--tt-color-primary)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.8rem',
              }}
            >
              <span>/proveedores/</span>
              <ExternalLink size={13} />
            </a>
          </div>
        </div>

        <div className="ops-modal-footer">
          <button
            onClick={onClose}
            style={{
              padding: '0.55rem 1.15rem',
              borderRadius: '0.5rem',
              background: 'var(--tt-color-border-dark)',
              color: 'var(--tt-color-text-main)',
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
