import React, { useState } from 'react';
import { CalendarDays, Pencil, Plus, Tag } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminDrawer } from '../../components/admin/AdminDrawer';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { MultiEntitySelect } from '../../components/admin/MultiEntitySelect';
import { EntitySearchSelect } from '../../components/admin/EntitySearchSelect';
import { AdminEmptyState } from '../../components/admin/AdminEmptyState';
import { Toast, type ToastType } from '../../components/ui/Toast';
import { useAdminPromotions } from '../../hooks/useAdminPromotions';
import { associateAdminPromotionCategory, associateAdminPromotionProduct, createAdminPromotion, updateAdminPromotion } from '../../api/adminPromotions.api';
import type { AdminPromotion } from '../../types/adminPromotion.types';

type TargetMode = 'PRODUCTOS' | 'CATEGORIA';
type RemoveTarget = { promotionId: number; kind: TargetMode; targetId: number; label: string };

export const AdminPromotionsPage: React.FC = () => {
  const { data, loading, error, reload } = useAdminPromotions();
  const [editing, setEditing] = useState<AdminPromotion | null | undefined>(undefined);
  const [mode, setMode] = useState<TargetMode>('PRODUCTOS');
  const [products, setProducts] = useState<Array<number | string>>([]);
  const [category, setCategory] = useState<number | string | null>(null);
  const [busy, setBusy] = useState(false);
  const [removing, setRemoving] = useState<RemoveTarget | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true);
    const form = new FormData(event.currentTarget);
    try {
      if (editing) {
        await updateAdminPromotion(editing.cod_promocion, { nombre: form.get('nombre'), valor: form.get('valor'), activo: editing.activo });
      } else {
        const result = await createAdminPromotion({ codigo: form.get('codigo'), nombre: form.get('nombre'), descripcion: form.get('descripcion'), tipo_descuento: form.get('tipo_descuento'), valor: form.get('valor'), fecha_inicio: form.get('fecha_inicio'), fecha_fin: form.get('fecha_fin'), acumulable: form.get('acumulable') === 'on' });
        if (!result.cod_promocion) throw new Error('El descuento se creó sin una referencia válida.');
        if (mode === 'PRODUCTOS') await associateAdminPromotionProduct(result.cod_promocion, { cod_productos: JSON.stringify(products) });
        else if (category != null) await associateAdminPromotionCategory(result.cod_promocion, { cod_categoria: category });
      }
      setEditing(undefined); setProducts([]); setCategory(null); setToast({ message: `Descuento ${editing ? 'actualizado' : 'creado y aplicado'} correctamente.`, type: 'success' }); await reload();
    } catch (reason) { setToast({ message: reason instanceof Error ? reason.message : 'No fue posible guardar el descuento.', type: 'error' }); }
    finally { setBusy(false); }
  };

  const now = new Date();
  return <AdminLayout title="Descuentos del catálogo">
    {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}
    <div className="admin-page-heading"><div><h1>Descuentos</h1><p>Crea reglas comerciales para varios productos o una categoría completa. El precio final se resuelve en PostgreSQL.</p></div><button type="button" className="tt-btn tt-btn--primary" onClick={() => setEditing(null)}><Plus size={17} />Nuevo descuento</button></div>
    {error ? <div className="admin-alert admin-alert-error" role="alert">{error}<button type="button" onClick={reload}>Reintentar</button></div> : null}
    {!loading && !data.promociones.length ? <AdminEmptyState title="No hay descuentos" description="Crea el primer descuento y elige dónde aplicarlo." /> : null}
    {data.promociones.length ? <div className="admin-discount-grid">{data.promociones.map((item) => {
      const direct = data.asociaciones.filter((association) => association.cod_promocion === item.cod_promocion);
      const categories = data.asociaciones_categorias.filter((association) => association.cod_promocion === item.cod_promocion);
      const started = new Date(item.inicio) <= now; const ended = new Date(item.fin) < now;
      const status = !item.activo ? 'Inactivo' : ended ? 'Finalizado' : started ? 'Activo' : 'Programado';
      return <article className="admin-discount-card" key={item.cod_promocion}><header><div><span className="admin-discount-card__code"><Tag size={15} />{item.codigo}</span><h2>{item.nombre}</h2></div><span className={`admin-status ${status === 'Activo' ? 'admin-status-active' : 'admin-status-inactive'}`}>{status}</span></header><div className="admin-discount-card__value">{item.tipo === 'PORCENTAJE' ? `${Number(item.valor)}%` : `$${Number(item.valor).toFixed(2)}`} <small>de descuento</small></div><p><CalendarDays size={15} />{new Date(item.inicio).toLocaleDateString('es-EC')} — {new Date(item.fin).toLocaleDateString('es-EC')}</p><div className="admin-discount-targets"><strong>Aplicado a</strong>{!direct.length && !categories.length ? <span className="admin-muted">Sin asociaciones</span> : null}{direct.map((association) => <span key={`p-${association.cod_producto}`}>{association.producto}<button type="button" aria-label={`Retirar ${association.producto}`} onClick={() => setRemoving({ promotionId: item.cod_promocion, kind: 'PRODUCTOS', targetId: association.cod_producto, label: association.producto })}>×</button></span>)}{categories.map((association) => <span key={`c-${association.cod_categoria}`}>Categoría: {association.categoria}<button type="button" aria-label={`Retirar ${association.categoria}`} onClick={() => setRemoving({ promotionId: item.cod_promocion, kind: 'CATEGORIA', targetId: association.cod_categoria, label: association.categoria })}>×</button></span>)}</div><footer><button type="button" className="tt-btn tt-btn--secondary tt-btn--small" onClick={() => setEditing(item)}><Pencil size={15} />Editar</button><button type="button" className={`tt-btn tt-btn--small ${item.activo ? 'tt-btn--danger' : 'tt-btn--secondary'}`} onClick={async () => { setBusy(true); try { await updateAdminPromotion(item.cod_promocion, { nombre: item.nombre, valor: item.valor, activo: !item.activo, desactivar: item.activo }); setToast({ message: `Descuento ${item.activo ? 'desactivado' : 'activado'}.`, type: 'success' }); await reload(); } catch (reason) { setToast({ message: reason instanceof Error ? reason.message : 'No fue posible cambiar el estado.', type: 'error' }); } finally { setBusy(false); } }}>{item.activo ? 'Desactivar' : 'Activar'}</button></footer></article>;
    })}</div> : null}
    {loading ? <div className="admin-loading-state">Cargando descuentos…</div> : null}

    <AdminDrawer open={editing !== undefined} title={editing ? 'Editar descuento' : 'Nuevo descuento'} onClose={() => setEditing(undefined)} wide>
      <form className="admin-form-section" onSubmit={submit}><div className="admin-form-grid"><label className="admin-field"><span className="admin-field__label">Nombre *</span><input name="nombre" required maxLength={160} defaultValue={editing?.nombre || ''} /></label>{!editing ? <label className="admin-field"><span className="admin-field__label">Código *</span><input name="codigo" required maxLength={60} placeholder="EJ. VUELTA-CLASES" /></label> : null}<label className="admin-field"><span className="admin-field__label">Tipo *</span><select name="tipo_descuento" disabled={Boolean(editing)} defaultValue={editing?.tipo || 'PORCENTAJE'}><option value="PORCENTAJE">Porcentaje</option><option value="MONTO_FIJO">Monto fijo</option></select></label><label className="admin-field"><span className="admin-field__label">Valor *</span><input name="valor" type="number" min="0.01" step="0.01" required defaultValue={editing?.valor || ''} /></label>{!editing ? <><label className="admin-field"><span className="admin-field__label">Inicio *</span><input name="fecha_inicio" type="datetime-local" required /></label><label className="admin-field"><span className="admin-field__label">Fin *</span><input name="fecha_fin" type="datetime-local" required /></label><label className="admin-field admin-field--full"><span className="admin-field__label">Descripción</span><textarea name="descripcion" rows={3} /></label><label className="admin-check"><input name="acumulable" type="checkbox" /><span>Puede acumularse con otras reglas permitidas</span></label></> : null}</div>
      {!editing ? <><fieldset className="admin-target-mode"><legend>Aplicar a *</legend><label><input type="radio" checked={mode === 'PRODUCTOS'} onChange={() => setMode('PRODUCTOS')} />Productos específicos</label><label><input type="radio" checked={mode === 'CATEGORIA'} onChange={() => setMode('CATEGORIA')} />Una categoría completa</label></fieldset>{mode === 'PRODUCTOS' ? <MultiEntitySelect label="Productos" required values={products} onChange={setProducts} options={data.productos.map((item) => ({ value: item.cod_producto, label: item.nombre, description: `${item.sku} · ${item.categoria}` }))} helperText="Puedes aplicar el mismo descuento a varios productos en una sola operación." /> : <EntitySearchSelect label="Categoría" required value={category} onChange={setCategory} options={data.categorias.filter((item) => item.activo).map((item) => ({ value: item.cod_categoria, label: item.nombre }))} />}</> : null}
      <div className="admin-form-actions"><button type="button" className="tt-btn tt-btn--secondary" onClick={() => setEditing(undefined)}>Cancelar</button><button type="submit" className="tt-btn tt-btn--primary" disabled={busy || (!editing && (mode === 'PRODUCTOS' ? !products.length : category == null))}>{busy ? 'Guardando…' : 'Guardar descuento'}</button></div></form>
    </AdminDrawer>
    <ConfirmDialog open={Boolean(removing)} title="Retirar asociación" message={`El descuento dejará de aplicarse a ${removing?.label || 'esta selección'}. No se eliminará el descuento ni su historial.`} confirmLabel="Retirar" busy={busy} onCancel={() => setRemoving(null)} onConfirm={async () => { if (!removing) return; setBusy(true); try { if (removing.kind === 'PRODUCTOS') await associateAdminPromotionProduct(removing.promotionId, { cod_producto: removing.targetId, desasociar: true }); else await associateAdminPromotionCategory(removing.promotionId, { cod_categoria: removing.targetId, desasociar: true }); setToast({ message: 'Asociación retirada.', type: 'success' }); setRemoving(null); await reload(); } catch (reason) { setToast({ message: reason instanceof Error ? reason.message : 'No fue posible retirar la asociación.', type: 'error' }); } finally { setBusy(false); } }} />
  </AdminLayout>;
};
