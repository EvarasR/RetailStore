import React, { useState, useEffect } from 'react';
import { X, PackageCheck, AlertCircle, Loader2 } from 'lucide-react';
import { WarehouseOrderStatusForm } from './WarehouseOrderStatusForm';
import type { WarehouseOrderItem } from '../../types/warehouse.types';
import type { WarehouseOrderDetailResponse } from '../../api/warehouse.api';

interface WarehouseOrderDrawerProps {
  order: WarehouseOrderItem | null;
  loading: boolean;
  onClose: () => void;
  onFetchDetail: (cod_pedido: number) => Promise<WarehouseOrderDetailResponse>;
  onUpdateState: (cod_pedido: number, nuevoEstado: string, comentario: string) => Promise<unknown>;
  onReload: () => void;
}

export const WarehouseOrderDrawer: React.FC<WarehouseOrderDrawerProps> = ({
  order,
  loading: parentLoading,
  onClose,
  onFetchDetail,
  onUpdateState,
  onReload,
}) => {
  const [detail, setDetail] = useState<WarehouseOrderDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);

  useEffect(() => {
    if (!order) {
      setDetail(null);
      setErrorDetail(null);
      return;
    }
    let isMounted = true;
    const load = async () => {
      setLoadingDetail(true);
      setErrorDetail(null);
      try {
        const res = await onFetchDetail(order.cod_pedido);
        if (isMounted) setDetail(res);
      } catch (err: unknown) {
        if (isMounted) {
          setErrorDetail(err instanceof Error ? err.message : 'No se pudo leer el pedido');
        }
      } finally {
        if (isMounted) setLoadingDetail(false);
      }
    };
    load();
    return () => {
      isMounted = false;
    };
  }, [order, onFetchDetail]);

  if (!order) return null;

  return (
    <div className="ops-drawer-overlay" onClick={onClose}>
      <div className="ops-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ops-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <PackageCheck size={20} color="var(--tt-color-primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--tt-color-text-main)' }}>
              Bitácora y Picking de Pedido
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

        <div className="ops-drawer-body">
          <div style={{ background: 'var(--tt-color-text-main)', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-surface-subtle)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--tt-color-text-light)', fontWeight: 600 }}>
                ORDEN #{order.cod_pedido}
              </span>
              <span className="ops-badge ops-badge--media">
                {order.estado}
              </span>
            </div>
            <h4 style={{ margin: '0.5rem 0 0.25rem', fontSize: '1.1rem', color: 'var(--tt-color-text-main)' }}>
              Cliente: {order.cliente}
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>
              Total Pedido: <strong style={{ color: 'var(--tt-color-success)' }}>{order.total}</strong> &bull; {order.fecha}
            </div>
          </div>

          {loadingDetail && (
            <div style={{ textAlign: 'center', padding: '2rem 0', color: 'var(--tt-color-text-light)' }}>
              <Loader2 size={24} className="animate-spin" style={{ margin: '0 auto 0.5rem' }} />
              <span>Consultando líneas y lotes en PostgreSQL...</span>
            </div>
          )}

          {errorDetail && (
            <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid var(--tt-color-error)', color: 'var(--tt-color-error)', padding: '1rem', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <AlertCircle size={18} />
              <span>{errorDetail}</span>
            </div>
          )}

          {detail && (
            <>
              <div>
                <h5 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#e2e8f0' }}>
                  Líneas para Picking y Preparación:
                </h5>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  {detail.detalles.map((d, idx) => (
                    <div
                      key={idx}
                      style={{
                        background: 'var(--tt-color-text-main)',
                        border: '1px solid var(--tt-color-surface-subtle)',
                        borderRadius: '0.5rem',
                        padding: '0.75rem 1rem',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <div>
                        <strong style={{ color: 'var(--tt-color-text-main)', fontSize: '0.95rem', display: 'block' }}>
                          {d.producto}
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: 'var(--tt-color-text-light)' }}>
                          Unitario: {d.precio_final}
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ background: 'var(--tt-color-surface)', color: 'var(--tt-color-primary)', padding: '0.25rem 0.6rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.85rem' }}>
                          x{d.cantidad} unid.
                        </span>
                        <div style={{ fontSize: '0.8rem', color: 'var(--tt-color-text-light)', marginTop: '0.2rem' }}>
                          {d.subtotal}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {detail.lotes.length > 0 && (
                <div>
                  <h5 style={{ margin: '1rem 0 0.5rem', fontSize: '0.9rem', color: 'var(--tt-color-text-light)' }}>
                    Lotes Asignados en Despacho:
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {detail.lotes.map((l, i) => (
                      <div
                        key={i}
                        style={{
                          background: 'var(--tt-color-surface)',
                          border: '1px dashed var(--tt-color-border-dark)',
                          padding: '0.6rem 0.85rem',
                          borderRadius: '0.5rem',
                          fontSize: '0.85rem',
                          display: 'flex',
                          justifyContent: 'space-between',
                        }}
                      >
                        <span>
                          <strong style={{ color: 'var(--tt-color-warning)' }}>Lote #{l.lote}</strong> — {l.producto}
                        </span>
                        <span style={{ fontWeight: 600, color: '#e2e8f0' }}>
                          x{l.cantidad}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <WarehouseOrderStatusForm
            cod_pedido={order.cod_pedido}
            estadoActual={order.estado}
            estadosDisponibles={[]}
            loading={parentLoading}
            onUpdateState={onUpdateState}
            onSuccess={() => {
              onReload();
            }}
          />
        </div>

        <div className="ops-drawer-footer">
          <button
            onClick={onClose}
            style={{
              padding: '0.6rem 1.25rem',
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
