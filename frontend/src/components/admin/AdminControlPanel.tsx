import React from 'react';
import type {
  AdminControlUser,
  AdminControlRole,
  AdminControlAuditLog,
  AdminControlAbandonedCart,
} from '../../types/adminControl.types';
import { ShieldCheck, Users, Lock, ShoppingCart, Activity } from 'lucide-react';

interface AdminControlPanelProps {
  modulo: string;
  usuarios: AdminControlUser[];
  roles: AdminControlRole[];
  registros: AdminControlAuditLog[];
  carritos: AdminControlAbandonedCart[];
  loading: boolean;
  onChangeModule: (newMod: string) => void;
}

export const AdminControlPanel: React.FC<AdminControlPanelProps> = ({
  modulo,
  usuarios,
  roles,
  registros,
  carritos,
  loading,
  onChangeModule,
}) => {
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
          onClick={() => onChangeModule('usuarios')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: modulo === 'usuarios' ? 'var(--color-surface)' : 'transparent',
            border: 'none',
            borderBottom: modulo === 'usuarios' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: modulo === 'usuarios' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <Users size={16} />
          <span>Gestión de Usuarios y Roles ({usuarios.length})</span>
        </button>

        <button
          type="button"
          onClick={() => onChangeModule('auditoria')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: modulo === 'auditoria' ? 'var(--color-surface)' : 'transparent',
            border: 'none',
            borderBottom: modulo === 'auditoria' ? '2px solid var(--color-primary)' : '2px solid transparent',
            color: modulo === 'auditoria' ? 'var(--color-primary)' : 'var(--color-text-muted)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <Activity size={16} />
          <span>Auditoría y Carritos Abandonados</span>
        </button>
      </div>

      {loading ? (
        <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
          Cargando módulo de control empresarial y auditoría en BD...
        </div>
      ) : modulo === 'usuarios' ? (
        <div>
          <div style={{ marginBottom: '2.5rem' }}>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--color-text)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Users size={18} color="var(--color-primary)" />
              <span>Directorio de Usuarios Registrados ({usuarios.length})</span>
            </h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Usuario / Correo</th>
                    <th>Nombres y Apellidos</th>
                    <th>Teléfono</th>
                    <th>Roles Asignados DB</th>
                    <th>Email Verificado</th>
                    <th>Estado</th>
                    <th>Fecha Alta</th>
                  </tr>
                </thead>
                <tbody>
                  {usuarios.map((usr) => (
                    <tr key={usr.cod_usuario}>
                      <td style={{ fontWeight: 600, color: 'var(--color-primary)' }}>{usr.email}</td>
                      <td>{usr.nombres} {usr.apellidos}</td>
                      <td>{usr.telefono || 'No reg.'}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap' }}>
                          {usr.roles && usr.roles.length > 0 ? (
                            usr.roles.map((r, idx) => (
                              <span
                                key={idx}
                                style={{
                                  padding: '0.15rem 0.45rem',
                                  borderRadius: 'var(--radius-sm)',
                                  background: 'rgba(37, 99, 235, 0.1)',
                                  color: 'var(--color-primary)',
                                  fontSize: '0.72rem',
                                  fontWeight: 700,
                                }}
                              >
                                {r}
                              </span>
                            ))
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>CLIENTE</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`status-badge ${usr.verificado ? 'status-active' : 'status-inactive'}`}>
                          {usr.verificado ? 'SÍ' : 'NO'}
                        </span>
                      </td>
                      <td>
                        <span className={`status-badge ${usr.activo ? 'status-active' : 'status-inactive'}`}>
                          {usr.activo ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{usr.fecha}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--color-text)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <ShieldCheck size={18} color="var(--color-success)" />
              <span>Catálogo de Roles Oficiales ({roles.length})</span>
            </h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Código Rol</th>
                    <th>Nombre Identificador</th>
                    <th>Descripción</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {roles.map((rl) => (
                    <tr key={rl.cod_rol}>
                      <td style={{ fontWeight: 700 }}>#{rl.cod_rol}</td>
                      <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{rl.nombre}</td>
                      <td style={{ fontSize: '0.85rem' }}>{rl.descripcion}</td>
                      <td>
                        <span className={`status-badge ${rl.activo ? 'status-active' : 'status-inactive'}`}>
                          {rl.activo ? 'ACTIVO' : 'INACTIVO'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '2.5rem' }}>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--color-text)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <Lock size={18} color="var(--color-warning)" />
              <span>Logs de Auditoría y Eventos del Sistema ({registros.length})</span>
            </h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th># Reg.</th>
                    <th>Usuario Responsable</th>
                    <th>Acción Ejecutada</th>
                    <th>Módulo DB</th>
                    <th>Dirección IP</th>
                    <th>Fecha Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                        No hay registros de auditoría recientes en PostgreSQL.
                      </td>
                    </tr>
                  ) : (
                    registros.map((reg) => (
                      <tr key={reg.cod_registro}>
                        <td style={{ fontWeight: 700 }}>#{reg.cod_registro}</td>
                        <td style={{ fontWeight: 600 }}>{reg.usuario}</td>
                        <td>{reg.accion}</td>
                        <td>
                          <span className="status-badge status-active">{reg.modulo}</span>
                        </td>
                        <td style={{ fontFamily: 'monospace' }}>{reg.ip}</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{reg.fecha}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div>
            <h3
              style={{
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'var(--color-text)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
              }}
            >
              <ShoppingCart size={18} color="var(--color-error)" />
              <span>Registro de Carritos Abandonados ({carritos.length})</span>
            </h3>
            <div className="admin-table-container">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th># Carrito</th>
                    <th>Usuario Cliente</th>
                    <th>Valor Estimado DB</th>
                    <th>Artículos</th>
                    <th>Fecha Registro</th>
                  </tr>
                </thead>
                <tbody>
                  {carritos.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                        No hay carritos abandonados pendientes.
                      </td>
                    </tr>
                  ) : (
                    carritos.map((cart) => (
                      <tr key={cart.cod_carrito}>
                        <td style={{ fontWeight: 700 }}>#{cart.cod_carrito}</td>
                        <td style={{ fontWeight: 600 }}>{cart.usuario}</td>
                        <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>{cart.valor}</td>
                        <td>{cart.items} ítems</td>
                        <td style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>{cart.fecha}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
