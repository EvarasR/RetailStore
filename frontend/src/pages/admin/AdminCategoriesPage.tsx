import React, { useEffect, useMemo, useState } from 'react';
import { FolderTree, Pencil, Plus, Search } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminDrawer } from '../../components/admin/AdminDrawer';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { AdminEmptyState } from '../../components/admin/AdminEmptyState';
import { Toast, type ToastType } from '../../components/ui/Toast';
import { createAdminCategory, fetchAdminCategories, updateAdminCategory } from '../../api/adminCatalog.api';
import type { CatalogCategory } from '../../types/adminCatalog.types';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [editing, setEditing] = useState<CatalogCategory | null | undefined>(undefined);
  const [confirming, setConfirming] = useState<CatalogCategory | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try { setCategories(await fetchAdminCategories()); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'No fue posible cargar las categorías.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase('es');
    return term ? categories.filter((item) => `${item.nombre} ${item.descripcion || ''}`.toLocaleLowerCase('es').includes(term)) : categories;
  }, [categories, query]);

  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      if (editing) {
        await updateAdminCategory(editing.cod_categoria, { nombre: form.get('nombre'), descripcion: form.get('descripcion'), activo: editing.activo });
      } else {
        await createAdminCategory({ nombre: String(form.get('nombre') || ''), slug: '', descripcion: String(form.get('descripcion') || '') });
      }
      setEditing(undefined); setToast({ message: `Categoría ${editing ? 'actualizada' : 'creada'} correctamente.`, type: 'success' }); await load();
    } catch (reason) { setToast({ message: reason instanceof Error ? reason.message : 'No fue posible guardar la categoría.', type: 'error' }); }
    finally { setBusy(false); }
  };

  return <AdminLayout title="Categorías del catálogo">
    {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}
    <div className="admin-page-heading"><div><h1>Categorías</h1><p>Organiza el catálogo con nombres claros. La dirección interna se genera automáticamente.</p></div><button type="button" className="tt-btn tt-btn--primary" onClick={() => setEditing(null)}><Plus size={17} />Nueva categoría</button></div>
    <div className="admin-catalog-toolbar admin-catalog-toolbar--compact"><label className="admin-search-field"><Search size={17} /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Buscar categorías…" aria-label="Buscar categorías" /></label></div>
    {error ? <div className="admin-alert admin-alert-error" role="alert">{error}<button type="button" onClick={load}>Reintentar</button></div> : null}
    {!loading && !filtered.length ? <AdminEmptyState title="No hay categorías" description="Crea la primera categoría o cambia el término de búsqueda." /> : null}
    {filtered.length ? <div className="admin-table-container"><table className="admin-table"><thead><tr><th>Categoría</th><th>Descripción</th><th>Productos</th><th>Estado</th><th><span className="sr-only">Acciones</span></th></tr></thead><tbody>{filtered.map((item) => <tr key={item.cod_categoria}><td><span className="admin-entity-name"><FolderTree size={17} />{item.nombre}</span></td><td>{item.descripcion || 'Sin descripción'}</td><td>{item.total_productos ?? 0}</td><td><span className={`admin-status ${item.activo ? 'admin-status-active' : 'admin-status-inactive'}`}>{item.activo ? 'Activa' : 'Inactiva'}</span></td><td><div className="admin-row-actions"><button type="button" className="tt-btn tt-btn--secondary tt-btn--small" onClick={() => setEditing(item)}><Pencil size={15} />Editar</button><button type="button" className={`tt-btn tt-btn--small ${item.activo ? 'tt-btn--danger' : 'tt-btn--secondary'}`} onClick={() => setConfirming(item)}>{item.activo ? 'Desactivar' : 'Activar'}</button></div></td></tr>)}</tbody></table></div> : null}
    {loading ? <div className="admin-loading-state">Cargando categorías…</div> : null}

    <AdminDrawer open={editing !== undefined} title={editing ? 'Editar categoría' : 'Nueva categoría'} onClose={() => setEditing(undefined)}>
      <form className="admin-form-section" onSubmit={save}><label className="admin-field"><span className="admin-field__label">Nombre *</span><input name="nombre" required maxLength={120} defaultValue={editing?.nombre || ''} /></label><label className="admin-field"><span className="admin-field__label">Descripción</span><textarea name="descripcion" rows={5} maxLength={500} defaultValue={editing?.descripcion || ''} /></label><p className="admin-field__helper">El nombre y la descripción son lo que verá el equipo; no necesitas escribir identificadores ni direcciones técnicas.</p><div className="admin-form-actions"><button type="button" className="tt-btn tt-btn--secondary" onClick={() => setEditing(undefined)}>Cancelar</button><button type="submit" className="tt-btn tt-btn--primary" disabled={busy}>{busy ? 'Guardando…' : 'Guardar categoría'}</button></div></form>
    </AdminDrawer>
    <ConfirmDialog open={Boolean(confirming)} title={`${confirming?.activo ? 'Desactivar' : 'Activar'} categoría`} message={confirming?.activo ? 'La categoría no aparecerá en selectores nuevos. Los productos existentes conservarán su clasificación.' : 'La categoría volverá a estar disponible para clasificar productos.'} confirmLabel={confirming?.activo ? 'Desactivar' : 'Activar'} busy={busy} onCancel={() => setConfirming(null)} onConfirm={async () => { if (!confirming) return; setBusy(true); try { await updateAdminCategory(confirming.cod_categoria, { nombre: confirming.nombre, descripcion: confirming.descripcion || '', activo: !confirming.activo, desactivar: confirming.activo }); setToast({ message: `Categoría ${confirming.activo ? 'desactivada' : 'activada'}.`, type: 'success' }); setConfirming(null); await load(); } catch (reason) { setToast({ message: reason instanceof Error ? reason.message : 'No fue posible cambiar el estado.', type: 'error' }); } finally { setBusy(false); } }} />
  </AdminLayout>;
};
