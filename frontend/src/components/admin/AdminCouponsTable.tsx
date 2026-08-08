import React from 'react';
import type { AdminCouponItem, AdminCouponUsage } from '../../types/adminCoupon.types';
import { Users, Calendar } from 'lucide-react';

interface AdminCouponsTableProps {
  coupons: AdminCouponItem[];
  usage: AdminCouponUsage[];
  loading: boolean;
}

export const AdminCouponsTable: React.FC<AdminCouponsTableProps> = ({ coupons, usage, loading }) => {
  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--tt-color-text-muted)' }}>
        Cargando registro oficial de cupones de descuento...
      </div>
    );
  }

  if (coupons.length === 0) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--tt-color-text-muted)' }}>
        No hay cupones registrados en la base de datos de marketing.
      </div>
    );
  }

  return (
    <div>
      <div className="admin-table-container" style={{ marginBottom: '2rem' }}>
        <table className="admin-table">
          <thead>
            <tr>
              <th>Código de Cupón</th>
              <th>Nombre</th>
              <th>Tipo Descuento</th>
              <th>Valor DB</th>
              <th>Monto Mínimo</th>
              <th>Límites (Máx / Por Usuario)</th>
              <th>Vigencia</th>
              <th>Estado</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => (
              <tr key={c.cod_cupon}>
                <td>
                  <span
                    style={{
                      fontFamily: 'monospace',
                      fontWeight: 700,
                      padding: '0.25rem 0.5rem',
                      background: 'rgba(37, 99, 235, 0.1)',
                      color: 'var(--tt-color-primary)',
                      borderRadius: 'var(--tt-radius-sm)',
                    }}
                  >
                    {c.codigo}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>{c.nombre}</td>
                <td>{c.tipo}</td>
                <td style={{ fontWeight: 700, color: 'var(--tt-color-success)' }}>{c.valor}</td>
                <td>{c.monto_minimo}</td>
                <td>
                  <span style={{ fontSize: '0.8rem', color: 'var(--tt-color-text-muted)' }}>
                    {c.usos_maximos || 'Sin límite'} / {c.usos_por_usuario} por cliente
                  </span>
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem' }}>
                    <Calendar size={13} color="var(--tt-color-text-muted)" />
                    <span>{c.inicio} → {c.fin}</span>
                  </div>
                </td>
                <td>
                  <span className={`status-badge ${c.activo ? 'status-active' : 'status-inactive'}`}>
                    {c.activo ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {usage.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3
            style={{
              fontSize: '1.1rem',
              fontWeight: 600,
              color: 'var(--tt-color-text-main)',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <Users size={18} color="var(--tt-color-primary)" />
            <span>Historial Oficial de Usos en Pedidos ({usage.length})</span>
          </h3>
          <div className="admin-table-container">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Cupón</th>
                  <th>Cliente</th>
                  <th>Pedido Asociado</th>
                  <th>Valor Aplicado DB</th>
                  <th>Fecha de Uso</th>
                </tr>
              </thead>
              <tbody>
                {usage.map((u) => (
                  <tr key={u.cod_uso}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 600, color: 'var(--tt-color-primary)' }}>
                        {u.cupon}
                      </span>
                    </td>
                    <td>{u.cliente}</td>
                    <td style={{ fontWeight: 600 }}>#{u.pedido}</td>
                    <td style={{ fontWeight: 700, color: 'var(--tt-color-success)' }}>{u.valor}</td>
                    <td style={{ fontSize: '0.825rem', color: 'var(--tt-color-text-muted)' }}>{u.fecha}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
