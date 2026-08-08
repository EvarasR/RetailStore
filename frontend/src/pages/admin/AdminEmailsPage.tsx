import React, { useCallback, useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminModuleHeader } from '../../components/admin/AdminModuleHeader';
import { fetchAdminEmails, retryAdminEmail, type AdminEmailItem } from '../../api/adminEmails.api';

export const AdminEmailsPage: React.FC = () => {
  const [emails, setEmails] = useState<AdminEmailItem[]>([]);
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try { setEmails(await fetchAdminEmails(query, status)); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No se pudo cargar la cola.'); }
    finally { setLoading(false); }
  }, [query, status]);
  useEffect(() => { void load(); }, [load]);
  const retry = async (codEmail: number) => { await retryAdminEmail(codEmail); await load(); };
  return (
    <AdminLayout title="Emails transaccionales">
      <div className="admin-page">
        <AdminModuleHeader title="Cola de emails" subtitle="Estado, intentos y reintentos seguros. Las credenciales SMTP nunca se muestran." onReload={load} loading={loading} />
        <div className="tt-card" style={{ padding: '1rem', display: 'flex', gap: '.75rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <input className="tt-input" placeholder="Buscar destinatario, tipo o asunto" value={query} onChange={(event) => setQuery(event.target.value)} />
          <select className="tt-input" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Todos los estados</option><option>PENDIENTE</option><option>FALLIDO</option><option>ENVIADO</option><option>CANCELADO</option></select>
        </div>
        {error && <div className="admin-alert admin-alert-error">{error}</div>}
        <div className="admin-table-container"><table className="admin-table"><thead><tr><th>Fecha</th><th>Destinatario</th><th>Tipo</th><th>Asunto</th><th>Estado</th><th>Intentos</th><th>Último error</th><th>Acciones</th></tr></thead><tbody>
          {emails.map((email) => <tr key={email.cod_email}><td>{email.fecha}</td><td>{email.destinatario}</td><td>{email.tipo}</td><td>{email.asunto}</td><td>{email.estado}</td><td>{email.intentos}/{email.max_intentos}</td><td>{email.error || '—'}</td><td>{email.estado !== 'ENVIADO' && <button type="button" className="tt-btn tt-btn--secondary" onClick={() => void retry(email.cod_email)}>Reintentar</button>}</td></tr>)}
        </tbody></table></div>
      </div>
    </AdminLayout>
  );
};
