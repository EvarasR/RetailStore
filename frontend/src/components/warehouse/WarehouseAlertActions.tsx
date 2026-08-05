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
          background: '#111827',
          border: '1px solid #1f2937',
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
            <AlertTriangle color="#f59e0b" size={24} />
            <h3 style={{ margin: 0, fontSize: '1.15rem', color: '#f8fafc' }}>
              Atención de Alerta de Stock
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer' }}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ background: '#0f172a', padding: '1rem', borderRadius: '0.5rem', border: '1px solid #334155', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>
            Alerta #{alerta.id} &bull; <strong style={{ color: '#e2e8f0' }}>{alerta.tipo}</strong>
          </div>
          <h4 style={{ margin: '0.35rem 0 0.5rem', fontSize: '1.05rem', color: '#f8fafc' }}>
            {alerta.producto}
          </h4>
          <p style={{ margin: 0, fontSize: '0.85rem', color: '#cbd5e1' }}>
            {alerta.tipo} reportada en {alerta.producto} ({alerta.almacen || 'Bodega General'})
          </p>
        </div>

        {errorMsg && (
          <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid #ef4444', color: '#ef4444', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
            {errorMsg}
          </div>
        )}

        {successMsg && (
          <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid #10b981', color: '#10b981', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CheckCircle2 size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {!confirming ? (
          <div>
            <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1.25rem', lineHeight: 1.5 }}>
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
                  border: '1px solid #334155',
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
                  background: '#3b82f6',
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
            <label style={{ display: 'block', fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
              Observación o Nota Logística (opcional):
            </label>
            <textarea
              value={observacion}
              onChange={(e) => setObservacion(e.target.value)}
              placeholder="Ej. Reorden tramitada, stock verificado físicamente en rack..."
              rows={3}
              style={{
                width: '100%',
                background: '#0f172a',
                border: '1px solid #334155',
                color: '#f8fafc',
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
                  border: '1px solid #334155',
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
                  background: '#10b981',
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
