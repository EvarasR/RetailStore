import React, { useState } from 'react';
import { X, CheckCircle2, FileText, Package, AlertCircle } from 'lucide-react';
import { AdminStatusBadge } from './AdminStatusBadge';
import type {
  AdminOrderDetailResponse,
  AdminOrderStatusOption,
} from '../../types/adminOrder.types';

interface AdminOrderDrawerProps {
  detail: AdminOrderDetailResponse | null;
  statusOptions: AdminOrderStatusOption[];
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onStatusChange: (cod_pedido: number, estado: string, comentario: string) => Promise<unknown>;
}

export const AdminOrderDrawer: React.FC<AdminOrderDrawerProps> = ({
  detail,
  statusOptions,
  loading,
  error,
  onClose,
  onStatusChange,
}) => {
  const [newStatus, setNewStatus] = useState('');
  const [comentario, setComentario] = useState('');
  const [saving, setSaving] = useState(false);
  const [actionMsg, setActionMsg] = useState<{ ok: boolean; text: string } | null>(null);

  if (!detail && !loading && !error) return null;

  const handleSubmitStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!detail || !newStatus) return;
    setSaving(true);
    setActionMsg(null);
    try {
      const res = (await onStatusChange(
        detail.pedido.cod_pedido,
        newStatus,
        comentario || 'Actualización de estado desde panel'
      )) as { ok: boolean; mensaje: string };
      setActionMsg({ ok: true, text: res.mensaje || 'Estado actualizado correctamente.' });
      setComentario('');
    } catch (err: unknown) {
      const text = err instanceof Error ? err.message : 'Error al cambiar estado de pedido.';
      setActionMsg({ ok: false, text });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="admin-drawer-overlay">
      <div className="admin-drawer-panel">
        <div className="admin-drawer-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Package className="text-blue-400" size={22} />
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#f8fafc' }}>
                Pedido #{detail?.pedido.numero_pedido || '...'}
              </h3>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                ID BD: {detail?.pedido.cod_pedido || '—'}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
            }}
          >
            <X size={20} />
          </button>
        </div>

        <div className="admin-drawer-content">
          {loading && (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#94a3b8' }}>
              Cargando detalle oficial desde PostgreSQL...
            </div>
          )}

          {error && (
            <div
              style={{
                padding: '1rem',
                background: 'rgba(239, 68, 68, 0.15)',
                color: '#ef4444',
                borderRadius: '0.5rem',
              }}
            >
              <AlertCircle size={18} /> {error}
            </div>
          )}

          {detail && (
            <>
              {/* RESUMEN DE CLIENTE Y TOTAL */}
              <div
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  padding: '1rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--tt-color-border)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Cliente</div>
                  <strong style={{ color: '#f8fafc', fontSize: '0.95rem' }}>
                    {detail.pedido.cliente}
                  </strong>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                    {detail.pedido.direccion}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Oficial DB</div>
                  <strong style={{ color: '#38bdf8', fontSize: '1.25rem' }}>
                    ${detail.pedido.total}
                  </strong>
                  <div style={{ marginTop: '0.25rem' }}>
                    <AdminStatusBadge status={detail.pedido.estado} />
                  </div>
                </div>
              </div>

              {/* FACTURA SI EXITE */}
              {detail.pedido.factura && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.65rem 1rem',
                    background: 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '0.5rem',
                    color: '#60a5fa',
                    fontSize: '0.8125rem',
                  }}
                >
                  <FileText size={16} />
                  <span>Factura fiscal emitida: #{detail.pedido.factura}</span>
                </div>
              )}

              {/* LÍNEAS DE PEDIDO */}
              <div>
                <h4
                  style={{
                    margin: '0 0 0.75rem 0',
                    fontSize: '0.9rem',
                    color: '#e2e8f0',
                    textTransform: 'uppercase',
                  }}
                >
                  Artículos en Pedido ({detail.detalles.length})
                </h4>
                <div className="admin-table-wrapper">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Producto</th>
                        <th>Cant.</th>
                        <th>Precio BD</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detail.detalles.map((d, i) => (
                        <tr key={i}>
                          <td>{d.producto}</td>
                          <td>{d.cantidad} un.</td>
                          <td>${d.precio_final}</td>
                          <td>
                            <strong>${d.subtotal}</strong>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* TRAZABILIDAD DE LOTES */}
              {detail.lotes && detail.lotes.length > 0 && (
                <div>
                  <h4
                    style={{
                      margin: '0 0 0.75rem 0',
                      fontSize: '0.9rem',
                      color: '#e2e8f0',
                      textTransform: 'uppercase',
                    }}
                  >
                    Asignación de Lotes ACID
                  </h4>
                  <div className="admin-table-wrapper">
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Lote BD</th>
                          <th>Producto</th>
                          <th>Cant.</th>
                          <th>PVP Hist.</th>
                        </tr>
                      </thead>
                      <tbody>
                        {detail.lotes.map((l, idx) => (
                          <tr key={idx}>
                            <td>
                              <span className="admin-badge admin-badge-gray">{l.lote}</span>
                            </td>
                            <td>{l.producto}</td>
                            <td>{l.cantidad} un.</td>
                            <td>${l.pvp_historico}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* GESTIÓN DE CAMBIO DE ESTADO */}
              <form
                onSubmit={handleSubmitStatus}
                style={{
                  background: 'rgba(255, 255, 255, 0.02)',
                  padding: '1.25rem',
                  borderRadius: '0.5rem',
                  border: '1px solid var(--tt-color-border)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
              >
                <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#f8fafc' }}>
                  Cambiar Estado de Operación (BD-First)
                </h4>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    required
                    style={{
                      flex: 1,
                      padding: '0.6rem',
                      backgroundColor: '#1e293b',
                      color: '#f8fafc',
                      border: '1px solid var(--tt-color-border)',
                      borderRadius: '0.375rem',
                    }}
                  >
                    <option value="">-- Seleccionar Estado --</option>
                    {statusOptions.map((s) => (
                      <option key={s.cod_estado_pedido} value={s.cod_estado_pedido}>
                        {s.nombre} ({s.cod_estado_pedido})
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  type="text"
                  placeholder="Comentario para la auditoría (opcional)"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  style={{
                    padding: '0.6rem',
                    backgroundColor: '#1e293b',
                    color: '#f8fafc',
                    border: '1px solid var(--tt-color-border)',
                    borderRadius: '0.375rem',
                  }}
                />

                {actionMsg && (
                  <div
                    style={{
                      padding: '0.65rem',
                      borderRadius: '0.375rem',
                      background: actionMsg.ok ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      color: actionMsg.ok ? '#10b981' : '#ef4444',
                      fontSize: '0.8125rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                    }}
                  >
                    {actionMsg.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    <span>{actionMsg.text}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={saving || !newStatus}
                  style={{
                    padding: '0.65rem 1rem',
                    background: newStatus ? '#3b82f6' : 'rgba(100, 116, 139, 0.2)',
                    color: newStatus ? '#ffffff' : '#64748b',
                    border: 'none',
                    borderRadius: '0.375rem',
                    cursor: newStatus ? 'pointer' : 'not-allowed',
                    fontWeight: 600,
                  }}
                >
                  {saving ? 'Aplicando cambio en PostgreSQL...' : 'Actualizar Estado en BD'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
