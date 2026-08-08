import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';

interface WarehouseOrderStatusFormProps {
  cod_pedido: number;
  estadoActual: string;
  estadosDisponibles: Array<{ cod_estado_pedido: string; nombre: string }>;
  loading: boolean;
  onUpdateState: (cod_pedido: number, nuevoEstado: string, comentario: string) => Promise<unknown>;
  onSuccess?: () => void;
}

export const WarehouseOrderStatusForm: React.FC<WarehouseOrderStatusFormProps> = ({
  cod_pedido,
  estadoActual,
  estadosDisponibles,
  loading,
  onUpdateState,
  onSuccess,
}) => {
  const [selectedEstado, setSelectedEstado] = useState(
    estadoActual === 'PAGADO' ? 'PREPARANDO' : 'LISTO_ENVIO'
  );
  const [comentario, setComentario] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const bodegaStates = estadosDisponibles.length > 0
    ? estadosDisponibles
    : [
        { cod_estado_pedido: 'PREPARANDO', nombre: 'Preparando en Almacén' },
        { cod_estado_pedido: 'LISTO_ENVIO', nombre: 'Listo para Envío / Despacho' },
      ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comentario.trim()) {
      setErrorMsg('Debes ingresar un comentario o nota obligatoria al cambiar el estado logístico.');
      return;
    }
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      await onUpdateState(cod_pedido, selectedEstado, comentario.trim());
      setSuccessMsg('Estado logístico de pedido procesado por la base de datos.');
      setComentario('');
      if (onSuccess) onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error
        ? err.message
        : 'El backend rechazó el cambio de estado.';
      setErrorMsg(msg);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        background: 'var(--tt-color-text-main)',
        border: '1px solid var(--tt-color-border-dark)',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        marginTop: '1rem',
      }}
    >
      <h5 style={{ margin: '0 0 0.75rem', fontSize: '0.95rem', color: 'var(--tt-color-text-main)' }}>
        Progresión Operativa de Despacho (DB-First)
      </h5>
      <p style={{ margin: '0 0 1rem', fontSize: '0.85rem', color: 'var(--tt-color-text-light)' }}>
        Estado actual en PostgreSQL: <strong style={{ color: 'var(--tt-color-primary)' }}>{estadoActual}</strong>
      </p>

      {errorMsg && (
        <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid var(--tt-color-error)', color: 'var(--tt-color-error)', padding: '0.65rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <AlertTriangle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div style={{ background: 'rgba(16,185,129,0.15)', border: '1px solid var(--tt-color-success)', color: 'var(--tt-color-success)', padding: '0.65rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <CheckCircle2 size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--tt-color-text-muted)', marginBottom: '0.35rem' }}>
          Seleccionar Nuevo Estado de Bodega:
        </label>
        <select
          value={selectedEstado}
          onChange={(e) => setSelectedEstado(e.target.value)}
          disabled={loading}
          className="ops-filter-select"
          style={{ width: '100%' }}
        >
          {bodegaStates.map((st) => (
            <option key={st.cod_estado_pedido} value={st.cod_estado_pedido}>
              {st.nombre} ({st.cod_estado_pedido})
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: '1rem' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--tt-color-text-muted)', marginBottom: '0.35rem' }}>
          Nota o Bitácora de Despacho (obligatorio):
        </label>
        <textarea
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          disabled={loading}
          placeholder="Ej. Paquete embalado correctamente con guía de despacho #..."
          rows={2}
          style={{
            width: '100%',
            background: 'var(--tt-color-surface)',
            border: '1px solid var(--tt-color-border-dark)',
            color: 'var(--tt-color-text-main)',
            padding: '0.65rem',
            borderRadius: '0.5rem',
            fontSize: '0.9rem',
            fontFamily: 'inherit',
          }}
        />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button
          type="submit"
          disabled={loading || !comentario.trim()}
          style={{
            padding: '0.6rem 1.25rem',
            borderRadius: '0.5rem',
            background: loading || !comentario.trim() ? '#475569' : 'var(--tt-color-primary)',
            color: '#ffffff',
            border: 'none',
            fontWeight: 600,
            cursor: loading || !comentario.trim() ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
          }}
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          <span>Transmitir Estado al Servidor</span>
        </button>
      </div>
    </form>
  );
};
