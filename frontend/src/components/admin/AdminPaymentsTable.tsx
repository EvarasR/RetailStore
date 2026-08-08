import React, { useState } from 'react';
import type {
  AdminPaymentTransaction,
  AdminPaymentAuthorization,
  AdminPaymentRefund,
  AdminPaymentInvoice,
  AdminPaymentReturn,
} from '../../types/adminPayment.types';
import { CreditCard, FileText, RefreshCcw, ShieldCheck, AlertCircle } from 'lucide-react';

interface AdminPaymentsTableProps {
  transacciones: AdminPaymentTransaction[];
  autorizaciones: AdminPaymentAuthorization[];
  reembolsos: AdminPaymentRefund[];
  facturas: AdminPaymentInvoice[];
  devoluciones: AdminPaymentReturn[];
  loading: boolean;
}

export const AdminPaymentsTable: React.FC<AdminPaymentsTableProps> = ({
  transacciones,
  autorizaciones,
  reembolsos,
  facturas,
  devoluciones,
  loading,
}) => {
  const [activeTab, setActiveTab] = useState<'tx' | 'auth' | 'facturas' | 'reembolsos' | 'devoluciones'>('tx');

  if (loading) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--tt-color-text-muted)' }}>
        Cargando transacciones contables en BD...
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          borderBottom: '1px solid var(--tt-color-border)',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('tx')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: activeTab === 'tx' ? 'var(--tt-color-surface)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'tx' ? '2px solid var(--tt-color-primary)' : '2px solid transparent',
            color: activeTab === 'tx' ? 'var(--tt-color-primary)' : 'var(--tt-color-text-muted)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <CreditCard size={16} />
          <span>Transacciones ({transacciones.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('auth')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: activeTab === 'auth' ? 'var(--tt-color-surface)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'auth' ? '2px solid var(--tt-color-primary)' : '2px solid transparent',
            color: activeTab === 'auth' ? 'var(--tt-color-primary)' : 'var(--tt-color-text-muted)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <ShieldCheck size={16} />
          <span>Autorizaciones ({autorizaciones.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('facturas')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: activeTab === 'facturas' ? 'var(--tt-color-surface)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'facturas' ? '2px solid var(--tt-color-primary)' : '2px solid transparent',
            color: activeTab === 'facturas' ? 'var(--tt-color-primary)' : 'var(--tt-color-text-muted)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <FileText size={16} />
          <span>Facturas Emitidas ({facturas.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reembolsos')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: activeTab === 'reembolsos' ? 'var(--tt-color-surface)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'reembolsos' ? '2px solid var(--tt-color-primary)' : '2px solid transparent',
            color: activeTab === 'reembolsos' ? 'var(--tt-color-primary)' : 'var(--tt-color-text-muted)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <RefreshCcw size={16} />
          <span>Reembolsos ({reembolsos.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('devoluciones')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.25rem',
            background: activeTab === 'devoluciones' ? 'var(--tt-color-surface)' : 'transparent',
            border: 'none',
            borderBottom: activeTab === 'devoluciones' ? '2px solid var(--tt-color-primary)' : '2px solid transparent',
            color: activeTab === 'devoluciones' ? 'var(--tt-color-primary)' : 'var(--tt-color-text-muted)',
            fontWeight: 600,
            fontSize: '0.875rem',
            cursor: 'pointer',
          }}
        >
          <AlertCircle size={16} />
          <span>Devoluciones ({devoluciones.length})</span>
        </button>
      </div>

      {activeTab === 'tx' && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th># Transacción</th>
                <th>Pedido Asociado</th>
                <th>Monto Oficial DB</th>
                <th>Estado Pago</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {transacciones.map((tx) => (
                <tr key={tx.cod_transaccion}>
                  <td style={{ fontWeight: 700 }}>#{tx.cod_transaccion}</td>
                  <td style={{ fontWeight: 600 }}>#{tx.pedido}</td>
                  <td style={{ fontWeight: 700, color: 'var(--tt-color-primary)' }}>{tx.monto}</td>
                  <td>
                    <span className="status-badge status-active">{tx.estado}</span>
                  </td>
                  <td style={{ fontSize: '0.825rem', color: 'var(--tt-color-text-muted)' }}>{tx.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'auth' && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th># Autorización</th>
                <th># Transacción</th>
                <th>Monto Autorizado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {autorizaciones.map((auth) => (
                <tr key={auth.cod_autorizacion}>
                  <td style={{ fontWeight: 700 }}>#{auth.cod_autorizacion}</td>
                  <td>#{auth.transaccion}</td>
                  <td style={{ fontWeight: 700, color: 'var(--tt-color-success)' }}>{auth.monto}</td>
                  <td style={{ fontSize: '0.825rem', color: 'var(--tt-color-text-muted)' }}>{auth.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'facturas' && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th># Factura</th>
                <th>Comprobante TechTail</th>
                <th>Pedido</th>
                <th>Total Facturado</th>
                <th>Estado</th>
                <th>Fecha Emisión</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {facturas.map((fac) => (
                <tr key={fac.cod_factura}>
                  <td style={{ fontWeight: 700 }}>#{fac.cod_factura}</td>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{fac.numero_factura}</td>
                  <td>#{fac.pedido}</td>
                  <td style={{ fontWeight: 700, color: 'var(--tt-color-primary)' }}>{fac.total}</td>
                  <td>
                    <span className="status-badge status-active">{fac.estado}</span>
                  </td>
                  <td style={{ fontSize: '0.825rem', color: 'var(--tt-color-text-muted)' }}>{fac.fecha}</td>
                  <td><div style={{ display: 'flex', gap: '.4rem' }}><a className="tt-btn tt-btn--secondary" href={fac.pdf_url} target="_blank" rel="noreferrer">Ver</a><a className="tt-btn tt-btn--primary" href={`${fac.pdf_url}?download=1`}>Descargar</a></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'reembolsos' && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th># Reembolso</th>
                <th># Transacción</th>
                <th>Monto Devuelto</th>
                <th>Estado</th>
                <th>Fecha</th>
              </tr>
            </thead>
            <tbody>
              {reembolsos.map((reem) => (
                <tr key={reem.cod_reembolso}>
                  <td style={{ fontWeight: 700 }}>#{reem.cod_reembolso}</td>
                  <td>#{reem.transaccion}</td>
                  <td style={{ fontWeight: 700, color: 'var(--tt-color-error)' }}>{reem.monto}</td>
                  <td>
                    <span className="status-badge status-pending">{reem.estado}</span>
                  </td>
                  <td style={{ fontSize: '0.825rem', color: 'var(--tt-color-text-muted)' }}>{reem.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'devoluciones' && (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th># Devolución</th>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Motivo</th>
                <th>Estado</th>
                <th>Fecha Solicitud</th>
              </tr>
            </thead>
            <tbody>
              {devoluciones.map((dev) => (
                <tr key={dev.cod_devolucion}>
                  <td style={{ fontWeight: 700 }}>#{dev.cod_devolucion}</td>
                  <td style={{ fontWeight: 600 }}>#{dev.pedido}</td>
                  <td>{dev.cliente}</td>
                  <td style={{ fontSize: '0.85rem' }}>{dev.motivo}</td>
                  <td>
                    <span className="status-badge status-pending">{dev.estado}</span>
                  </td>
                  <td style={{ fontSize: '0.825rem', color: 'var(--tt-color-text-muted)' }}>{dev.fecha}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
