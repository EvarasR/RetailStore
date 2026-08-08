import React, { useState } from 'react';
import { AlertTriangle, CheckCircle2, Loader2, X } from 'lucide-react';
import type { WarehouseAlertItem } from '../../types/warehouse.types';

interface WarehouseAlertActionsProps {
  alerta: WarehouseAlertItem | null;
  loading: boolean;
  onClose: () => void;
  onResolve: (cod_alerta: number, observacion: string) => Promise<unknown>;
}

export const WarehouseAlertActions: React.FC<WarehouseAlertActionsProps> = ({
  alerta,
  loading,
  onClose,
  onResolve,
}) => {
  const [observacion, setObservacion] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [confirming, setConfirming] = useState(false);

  if (!alerta) return null;

  const handleConfirmResolve = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await onResolve(
        alerta.id || alerta.cod_alerta || 0,
        observacion || 'Alerta atendida desde panel operativo'
      );
      setSuccessMsg('Alerta de inventario resuelta y registrada en PostgreSQL.');
      setTimeout(() => {
        onClose();
        setConfirming(false);
        setObservacion('');
      }, 1200);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'El servidor rechazó resolver esta alerta.';
      setErrorMsg(msg);
    }
  };

  return (
    <div className="ops-drawer-overlay" onClick={onClose}>
      <div
        style={{
          background: 'var(--tt-color-surface)',
          border: '1px solid var(--tt-color-surface-subtle)',
          borderRadius: '0.75rem',
          maxWidth: '480px',
          width: '90%',
          padding: '1.5rem',
          margin: 'auto',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <AlertTriangle color="var(--tt-color-warning)" size={24} />
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: 'var(--tt-color-text-main)' }}>
              Atención de Alerta de Stock
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: 'var(--tt-color-text-light)', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ background: 'var(--tt-color-text-main)', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--tt-color-border-dark)', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>
            Alerta #{alerta.id} &bull; <strong style={{ color: '#e2e8f0' }}>{alerta.tipo}</strong>
          </div>
          <h4 style={{ margin: '0.35rem 0 0.5rem', fontSize: '1.05rem', color: 'var(--tt-color-text-main)' }}>
            {alerta.producto}
          </h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--tt-color-text-muted)' }}>
            {alerta.tipo} reportada en {alerta.producto} ({alerta.almacen || 'Bodega General'})
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid var(--tt-color-error)', color: 'var(--tt-color-error)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid var(--tt-color-success)', color: 'var(--tt-color-success)', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {!confirming ? (
          <div>
            <p style={{ fontSize: '0.9rem', color: 'var(--tt-color-text-muted)', marginBottom: '1.25rem', lineHeight: 1.5 }}>
              ¿Deseas marcar esta alerta como resuelta en el motor operativo? Esto informará a administración que se ha tomado acción logística.
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={onClose}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '0.5rem',
                  background: 'transparent',
                  border: '1px solid var(--tt-color-border-dark)',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setConfirming(true)}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '0.5rem',
                  background: 'var(--tt-color-primary)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                Proceder con Resolución...
              </button>
            </div>
          </div>
        ) : (
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--tt-color-text-light)', marginBottom: '0.4rem' }}>
              Observación o Nota Logística (opcional):
            </label>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Ej. Reorden tramitada, stock verificado físicamente en rack..."
              rows={3}
              style={{
                width: '100%',
                background: 'var(--tt-color-text-main)',
                border: '1px solid var(--tt-color-border-dark)',
                color: 'var(--tt-color-text-main)',
                padding: '0.65rem',
                borderRadius: '0.5rem',
                marginBottom: '1.25rem',
                fontSize: '0.9rem',
                fontFamily: 'inherit',
              }}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
              <button
                type="button"
                onClick={() => setConfirming(false)}
                disabled={loading}
                style={{
                  padding: '0.6rem 1rem',
                  borderRadius: '0.5rem',
                  background: 'transparent',
                  border: '1px solid var(--tt-color-border-dark)',
                  color: '#e2e8f0',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                Volver
              </button>
              <button
                type="button"
                onClick={handleConfirmResolve}
                disabled={loading}
                style={{
                  padding: '0.6rem 1.25rem',
                  borderRadius: '0.5rem',
                  background: 'var(--tt-color-success)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                <span>Confirmar y Resolver Alerta</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
