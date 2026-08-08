import React from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import { AccountLayout } from '../../components/account/AccountLayout';
import { Alert } from '../../components/ui/Alert';
import { Skeleton } from '../../components/ui/Skeleton';
import { useInvoices } from '../../hooks/useInvoices';

export const InvoicesPage: React.FC = () => {
  const { invoices, loading, error, reload } = useInvoices();
  return (
    <AccountLayout title="Mis facturas" subtitle="Comprobantes fiscales emitidos para tus pedidos y valores oficiales de PostgreSQL.">
      <div className="tt-account-toolbar">
        <button type="button" className="tt-btn tt-btn--secondary" onClick={reload} disabled={loading}>
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>
      {error && <Alert variant="error">{error}</Alert>}
      {loading ? <Skeleton height="220px" /> : invoices.length === 0 ? (
        <div className="tt-card tt-account-empty"><FileText size={40} /><p>Aún no tienes facturas emitidas.</p></div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead><tr><th>Número</th><th>Pedido</th><th>Fecha</th><th>Subtotal</th><th>Descuento</th><th>Impuesto</th><th>Envío</th><th>Total</th><th>Estado</th></tr></thead>
            <tbody>{invoices.map((invoice) => (
              <tr key={invoice.cod_factura}>
                <td><strong>{invoice.numero_factura}</strong></td><td>{invoice.numero_pedido}</td><td>{invoice.fecha_emision}</td>
                <td>{invoice.subtotal}</td><td>{invoice.descuento}</td><td>{invoice.impuesto}</td><td>{invoice.costo_envio}</td>
                <td><strong>{invoice.total}</strong></td><td>{invoice.estado}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </AccountLayout>
  );
};
