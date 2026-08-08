import React, { useEffect, useState } from 'react';
import { X, ClipboardList, ExternalLink, ShieldCheck, Loader2 } from 'lucide-react';
import type { SupportOrderItem } from '../../types/supportInternal.types';

interface SupportOrderDrawerProps {
  order: SupportOrderItem | null;
  onClose: () => void;
  onFetchDetail: (cod_pedido: number) => Promise<{ linea_pedidos: unknown[] } | null>;
}

export const SupportOrderDrawer: React.FC<SupportOrderDrawerProps> = ({
  order,
  onClose,
  onFetchDetail,
}) => {
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [items, setItems] = useState<unknown[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (order?.cod_pedido) {
      setLoadingDetail(true);
      setErrorMsg(null);
      onFetchDetail(order.cod_pedido)
        .then((res) => {
          if (res && Array.isArray(res.linea_pedidos)) {
            setItems(res.linea_pedidos);
          } else {
            setItems([]);
          }
        })
        .catch((err) => {
          setErrorMsg(err instanceof Error ? err.message : 'No se pudo consultar el detalle del pedido en BD');
        })
        .finally(() => setLoadingDetail(false));
    } else {
      setItems([]);
    }
  }, [order, onFetchDetail]);

  if (!order) return null;

  return (
    <div className="ops-drawer-overlay" onClick={onClose}>
      <div className="ops-drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="ops-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <ClipboardList size={20} color="var(--tt-color-primary)" />
            <h3 style={{ margin: 0, fontSize: '1.1rem', color: 'var(--tt-color-text-main)' }}>
              Inspección DB-First de Pedido y Despacho
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
              <span style={{ fontSize: '0.8rem', color: 'var(--tt-color-text-light)', textTransform: 'uppercase' }}>
                PEDIDO #{order.cod_pedido}
              </span>
              <span className="ops-badge ops-badge--media">
                {order.estado}
              </span>
            </div>
            <h4 style={{ margin: '0.5rem 0 0.35rem', fontSize: '1.25rem', color: 'var(--tt-color-text-main)' }}>
              {order.cliente}
            </h4>
            <div style={{ fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>
              Fecha Emisión: <strong style={{ color: '#e2e8f0' }}>{order.fecha}</strong>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div style={{ background: 'var(--tt-color-text-main)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-surface-subtle)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>Monto Total BD</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--tt-color-success)', marginTop: '0.25rem' }}>
                {order.total}
              </div>
            </div>
            <div style={{ background: 'var(--tt-color-text-main)', padding: '1rem', borderRadius: '0.75rem', border: '1px solid var(--tt-color-surface-subtle)' }}>
              <span style={{ fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>Tracking Logístico</span>
              <div style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--tt-color-primary)', marginTop: '0.25rem', fontFamily: 'monospace' }}>
                {order.tracking || 'TRK-' + order.cod_pedido}
              </div>
            </div>
          </div>

          <div>
            <h5 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: '#e2e8f0' }}>
              Líneas del Pedido en PostgreSQL ({items.length}):
            </h5>

            {loadingDetail ? (
              <div style={{ background: 'var(--tt-color-text-main)', padding: '2rem', textAlign: 'center', borderRadius: '0.5rem', color: 'var(--tt-color-text-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                <Loader2 size={18} className="animate-spin" />
                <span>Consultando /panel/api/pedidos/{order.cod_pedido}/detalle/...</span>
              </div>
            ) : errorMsg ? (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid var(--tt-color-error)', color: 'var(--tt-color-error)', padding: '0.85rem', borderRadius: '0.5rem' }}>
                {errorMsg}
              </div>
            ) : items.length === 0 ? (
              <div style={{ background: 'var(--tt-color-text-main)', padding: '1.5rem', textAlign: 'center', borderRadius: '0.5rem', color: 'var(--tt-color-text-light)' }}>
                No se encontraron líneas asociadas en la base de datos.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {items.map((it: any, i: number) => (
                  <div
                    key={i}
                    style={{
                      background: 'var(--tt-color-text-main)',
                      border: '1px solid var(--tt-color-border-dark)',
                      borderRadius: '0.65rem',
                      padding: '0.85rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <strong style={{ color: 'var(--tt-color-text-main)', fontSize: '0.95rem' }}>
                        {it.nombre || it.producto || 'SKU Asignado'}
                      </strong>
                      <div style={{ fontSize: '0.8rem', color: 'var(--tt-color-text-light)', marginTop: '0.2rem' }}>
                        Cantidad: <strong style={{ color: '#e2e8f0' }}>{it.cantidad || 1}</strong>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: 'var(--tt-color-success)' }}>
                      ${(it.subtotal || it.precio_unitario || '0.00')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid var(--tt-color-primary)', padding: '1rem', borderRadius: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--tt-color-primary)', fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem' }}>
              <ShieldCheck size={18} />
              <span>Gestión Administrativa Avanzada y Reembolsos</span>
            </div>
            <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--tt-color-text-muted)', lineHeight: 1.5 }}>
              Para procesar reembolsos bancarios, modificaciones de líneas, anulaciones fiscales o cambios de facturación en el pedido, accede al módulo corporativo de Django.
            </p>
            <a
              href="/panel/"
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: 'var(--tt-color-primary)',
                color: '#ffffff',
                padding: '0.55rem 1rem',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.85rem',
              }}
            >
              <span>Abrir Gestión de Pedido en /panel/</span>
              <ExternalLink size={14} />
            </a>
          </div>
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
