import React from 'react';
import { Play, Pause, Power } from 'lucide-react';

interface AdminProductActionsProps {
  codProducto: number;
  estado: string;
  publicable: boolean;
  actionLoading: boolean;
  onPublish: (id: number) => Promise<unknown>;
  onPause: (id: number) => Promise<unknown>;
  onDeactivate: (id: number) => Promise<unknown>;
}

export const AdminProductActions: React.FC<AdminProductActionsProps> = ({
  codProducto,
  estado,
  publicable,
  actionLoading,
  onPublish,
  onPause,
  onDeactivate,
}) => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
      {estado !== 'PUBLICADO' && (
        <button
          type="button"
          onClick={() => onPublish(codProducto)}
          disabled={actionLoading || !publicable}
          title={publicable ? 'Publicar producto al catálogo' : 'Producto incompleto para publicar'}
          style={{
            padding: '0.35rem 0.6rem',
            background: publicable ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.1)',
            color: publicable ? 'var(--tt-color-success)' : 'var(--tt-color-text-muted)',
            border: '1px solid transparent',
            borderRadius: '0.375rem',
            cursor: publicable ? 'pointer' : 'not-allowed',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          <Play size={12} />
          <span>Publicar</span>
        </button>
      )}

      {estado === 'PUBLICADO' && (
        <button
          type="button"
          onClick={() => onPause(codProducto)}
          disabled={actionLoading}
          title="Pausar venta del producto"
          style={{
            padding: '0.35rem 0.6rem',
            background: 'rgba(245, 158, 11, 0.15)',
            color: 'var(--tt-color-warning)',
            border: '1px solid transparent',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          <Pause size={12} />
          <span>Pausar</span>
        </button>
      )}

      {estado !== 'DESACTIVADO' && (
        <button
          type="button"
          onClick={() => onDeactivate(codProducto)}
          disabled={actionLoading}
          title="Desactivar producto"
          style={{
            padding: '0.35rem 0.6rem',
            background: 'rgba(239, 68, 68, 0.15)',
            color: 'var(--tt-color-error)',
            border: '1px solid transparent',
            borderRadius: '0.375rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.3rem',
            fontSize: '0.75rem',
            fontWeight: 600,
          }}
        >
          <Power size={12} />
          <span>Desactivar</span>
        </button>
      )}
    </div>
  );
};
