import React from 'react';
import { FileText, RefreshCw } from 'lucide-react';
import { AccountLayout } from '../../components/account/AccountLayout';
import { Alert } from '../../components/ui/Alert';
import { Skeleton } from '../../components/ui/Skeleton';
import { useInvoices } from '../../hooks/useInvoices';
import { Link } from 'react-router-dom';
import { resendInvoice } from '../../api/invoices.api';

export const InvoicesPage: React.FC = () => {
  const { invoices, loading, error, reload } = useInvoices();
  const [message, setMessage] = React.useState<string | null>(null);
  const resend = async (codFactura: number) => {
    const result = await resendInvoice(codFactura);
    setMessage(result.mensaje);
  };
  return (
    <AccountLayout title="Mis facturas" subtitle="Comprobantes fiscales emitidos para tus pedidos y valores oficiales de PostgreSQL.">
      <div className="tt-account-toolbar">
        <button type="button" className="tt-btn tt-btn--secondary" onClick={reload} disabled={loading}>
          <RefreshCw size={16} /> Actualizar
        </button>
      </div>
      {error && <Alert variant="error">{error}</Alert>}
      {message && <Alert variant="success">{message}</Alert>}
      {loading ? <Skeleton height="220px" /> : invoices.length === 0 ? (
        <div className="tt-card tt-account-empty"><FileText size={40} /><p>Aún no tienes facturas emitidas.</p></div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead><tr><th>Número</th><th>Pedido</th><th>Fecha</th><th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
            <tbody>{invoices.map((invoice) => (
              <tr key={invoice.cod_factura}>
                <td><strong>{invoice.numero_factura}</strong></td><td>{invoice.numero_pedido}</td><td>{invoice.fecha_emision}</td>
                <td><strong>${invoice.total}</strong></td><td>{invoice.estado}</td>
                <td><div style={{ display: 'flex', gap: '.4rem', flexWrap: 'wrap' }}>
                  <a className="tt-btn tt-btn--secondary" href={invoice.pdf_url} target="_blank" rel="noreferrer">Ver</a>
                  <a className="tt-btn tt-btn--secondary" href={`${invoice.pdf_url}?download=1`}>Descargar PDF</a>
                  <Link className="tt-btn tt-btn--secondary" to={`/cuenta/pedidos/${invoice.cod_pedido}`}>Ver pedido</Link>
                  <button className="tt-btn tt-btn--primary" type="button" onClick={() => void resend(invoice.cod_factura)}>Reenviar</button>
                </div></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </AccountLayout>
  );
};
