import React, { useState } from 'react';
import type {
  AdminPrimePlan,
  AdminPrimeBenefit,
  AdminPrimeMembership,
  AdminPrimeUsage,
} from '../../types/adminPrime.types';
import { Crown, Gift, Users, History } from 'lucide-react';

interface AdminPrimePanelProps {
  planes: AdminPrimePlan[];
  beneficios: AdminPrimeBenefit[];
  membresias: AdminPrimeMembership[];
  usos: AdminPrimeUsage[];
  loading: boolean;
}

export const AdminPrimePanel: React.FC<AdminPrimePanelProps> = ({
  planes,
  beneficios,
  membresias,
  usos,
  loading,
}) => {
  const [activeTab, setActiveTab] = useState<'membresias' | 'planes' | 'beneficios' | 'usos'>('membresias');

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
        Cargando gestión corporativa de membresías Prime...
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--color-border)',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('membresias')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: activeTab === 'membresias' ? 'var(--color-surface)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'membresias' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'membresias' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <Users size={16} />
          <span>Membresías Activas ({membresias.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('planes')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: activeTab === 'planes' ? 'var(--color-surface)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'planes' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'planes' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <Crown size={16} />
          <span>Planes Prime ({planes.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('beneficios')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: activeTab === 'beneficios' ? 'var(--color-surface)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'beneficios' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'beneficios' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <Gift size={16} />
          <span>Beneficios Configurados ({beneficios.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('usos')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: activeTab === 'usos' ? 'var(--color-surface)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'usos' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: activeTab === 'usos' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <History size={16} />
          <span>Historial de Usos ({usos.length})</span>
        </button>
      </div>

      {activeTab === 'membresias' && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Usuario Cliente</th>
                <th>Plan Asociado</th>
                <th>Estado Membresía</th>
                <th>Fecha Inicio</th>
                <th>Fecha Fin</th>
              </tr>
            </thead>
            <tbody>
              {membresias.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                    No se encontraron membresías de usuarios activas.
                  </td>
                </tr>
              ) : (
                membresias.map((m) => (
                  <tr key={m.cod_membresia}>
                    <td style={{ fontWeight: 600 }}>{m.usuario}</td>
                    <td>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.35rem',
                          padding: '0.25rem 0.6rem',
                          background: 'rgba(234, 179, 8, 0.12)',
                          color: '#b45309',
                          borderRadius: 'var(--radius-sm)',
                          fontWeight: 700,
                          fontSize: '0.8rem',
                        }}
                      >
                        <Crown size={12} />
                        {m.plan}
                      </span>
                    </td>
                    <td>
                      <span className="status-badge status-active">{m.estado}</span>
                    </td>
                    <td style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>{m.inicio}</td>
                    <td style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>{m.fin}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'planes' && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código Plan</th>
                <th>Nombre</th>
                <th>Precio Oficial DB</th>
                <th>Duración</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {planes.map((p) => (
                <tr key={p.cod_plan}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700 }}>{p.codigo}</td>
                  <td style={{ fontWeight: 600 }}>{p.nombre}</td>
                  <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{p.precio}</td>
                  <td>{p.duracion_dias} días</td>
                  <td>
                    <span className={`status-badge ${p.activo ? 'status-active' : 'status-inactive'}`}>
                      {p.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'beneficios' && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Beneficio / Nombre</th>
                <th>Plan Asociado</th>
                <th>Valor DB</th>
                <th>Descripción</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {beneficios.map((b) => (
                <tr key={b.cod_beneficio}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{b.codigo}</td>
                  <td style={{ fontWeight: 600 }}>{b.nombre}</td>
                  <td>{b.plan}</td>
                  <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>{b.valor}</td>
                  <td style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>{b.descripcion}</td>
                  <td>
                    <span className={`status-badge ${b.activo ? 'status-active' : 'status-inactive'}`}>
                      {b.activo ? 'ACTIVO' : 'INACTIVO'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'usos' && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Beneficio Aplicado</th>
                <th>Pedido #</th>
                <th>Valor Ahorrado DB</th>
                <th>Fecha de Uso</th>
              </tr>
            </thead>
            <tbody>
              {usos.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                    No hay registro reciente de uso de beneficios Prime en pedidos.
                  </td>
                </tr>
              ) : (
                usos.map((u) => (
                  <tr key={u.cod_uso_beneficio}>
                    <td style={{ fontWeight: 600 }}>{u.usuario}</td>
                    <td>{u.beneficio}</td>
                    <td style={{ fontWeight: 700 }}>#{u.pedido}</td>
                    <td style={{ fontWeight: 700, color: 'var(--color-success)' }}>{u.valor}</td>
                    <td style={{ fontSize: '0.825rem', color: 'var(--color-text-muted)' }}>{u.fecha}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
