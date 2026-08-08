import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { AdminProductTable } from '../../components/admin/AdminProductTable';
import { AdminEmptyState } from '../../components/admin/AdminEmptyState';
import { AdminDrawer } from '../../components/admin/AdminDrawer';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { ProductWizard } from '../../components/admin/ProductWizard';
import { ProductManagementDrawer, type ProductManagementTab } from '../../components/admin/ProductManagementDrawer';
import { Toast, type ToastType } from '../../components/ui/Toast';
import { fetchProductCatalogOptions } from '../../api/adminCatalog.api';
import { useAdminProducts } from '../../hooks/useAdminProducts';
import type { ProductCatalogOptions } from '../../types/adminCatalog.types';

const emptyOptions: ProductCatalogOptions = { categorias: [], marcas: [], proveedores: [], atributos: [], productos: [] };

export const AdminProductsPage: React.FC = () => {
  const catalog = useAdminProducts();
  const [options, setOptions] = useState<ProductCatalogOptions>(emptyOptions);
  const [optionsLoading, setOptionsLoading] = useState(true);
  const [optionsError, setOptionsError] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [manageId, setManageId] = useState<number | null>(null);
  const [manageTab, setManageTab] = useState<ProductManagementTab>('datos');
  const [confirmId, setConfirmId] = useState<number | null>(null);
  const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);
  const loadOptions = async () => {
    setOptionsLoading(true); setOptionsError(null);
    try { setOptions(await fetchProductCatalogOptions()); }
    catch (reason) { setOptionsError(reason instanceof Error ? reason.message : 'No fue posible cargar las opciones del catálogo.'); }
    finally { setOptionsLoading(false); }
  };
  useEffect(() => { loadOptions(); }, []);
  const changed = async (message: string) => { setToast({ message, type: 'success' }); await catalog.refresh(); await loadOptions(); };
  const manage = (id: number, tab: ProductManagementTab) => { setManageTab(tab); setManageId(id); };

  return <AdminLayout title="Catálogo y Gestión de Productos">
    {toast ? <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} /> : null}
    <div className="admin-page-heading"><div><h1>Catálogo y productos</h1><p>Administra clasificación, proveedores, multimedia, documentos y publicación sin escribir identificadores técnicos.</p></div><button type="button" className="tt-btn tt-btn--primary" onClick={() => setCreateOpen(true)} disabled={optionsLoading}><Plus size={17} />Nuevo producto</button></div>
    {optionsError ? <div className="admin-alert admin-alert-error" role="alert">{optionsError}<button type="button" onClick={loadOptions}>Reintentar</button></div> : null}

    <form className="admin-catalog-toolbar" onSubmit={(event) => { event.preventDefault(); catalog.refresh(); }}>
      <label className="admin-search-field"><Search size={17} /><input value={catalog.q} onChange={(event) => catalog.setQ(event.target.value)} placeholder="Buscar por nombre o SKU…" aria-label="Buscar productos" /></label>
      <label><span>Categoría</span><select value={catalog.categoria} onChange={(event) => catalog.setCategoria(event.target.value)}><option value="">Todas</option>{options.categorias.filter((item) => item.activo).map((item) => <option key={item.cod_categoria} value={item.cod_categoria}>{item.nombre}</option>)}</select></label>
      <label><span>Estado</span><select value={catalog.estado} onChange={(event) => catalog.setEstado(event.target.value)}><option value="">Todos</option><option value="BORRADOR">Borrador</option><option value="EN_REVISION">En revisión</option><option value="PUBLICADO">Publicado</option><option value="PAUSADO">Pausado</option><option value="DESACTIVADO">Desactivado</option></select></label>
      <label><span>Proveedor</span><select value={catalog.proveedor} onChange={(event) => catalog.setProveedor(event.target.value)}><option value="">Todos</option>{options.proveedores.filter((item) => item.activo).map((item) => <option key={item.cod_proveedor} value={item.cod_proveedor}>{item.nombre}</option>)}</select></label>
      <button className="tt-btn tt-btn--secondary" type="submit">Aplicar filtros</button>
    </form>

    {catalog.error ? <div className="admin-alert admin-alert-error" role="alert">{catalog.error}<button type="button" onClick={catalog.refresh}>Reintentar</button></div> : null}
    {!catalog.loading && !catalog.products.length ? <AdminEmptyState title="No hay productos para estos filtros" description="Cambia los filtros o crea el primer producto del catálogo." /> : <AdminProductTable products={catalog.products} actionLoading={catalog.actionLoading} onPublish={async (id) => { const result = await catalog.handlePublish(id); setToast({ message: result.mensaje, type: 'success' }); }} onPause={async (id) => { const result = await catalog.handlePause(id); setToast({ message: result.mensaje, type: 'success' }); }} onDeactivate={async (id) => { setConfirmId(id); }} onManage={manage} />}
    {catalog.loading ? <div className="admin-loading-state">Cargando productos…</div> : null}

    <AdminDrawer open={createOpen} title="Nuevo producto" onClose={() => setCreateOpen(false)} wide><ProductWizard options={options} onSuccess={(message) => { setCreateOpen(false); changed(message); }} /></AdminDrawer>
    <ProductManagementDrawer productId={manageId} initialTab={manageTab} options={options} onClose={() => setManageId(null)} onChanged={changed} />
    <ConfirmDialog open={Boolean(confirmId)} title="Desactivar producto" message="El producto dejará de estar disponible en la tienda. Sus pedidos e historial no se eliminarán." confirmLabel="Desactivar" busy={catalog.actionLoading === confirmId} onCancel={() => setConfirmId(null)} onConfirm={async () => { if (!confirmId) return; try { const result = await catalog.handleDeactivate(confirmId); setToast({ message: result.mensaje, type: 'success' }); } catch (reason) { setToast({ message: reason instanceof Error ? reason.message : 'No fue posible desactivar el producto.', type: 'error' }); } finally { setConfirmId(null); } }} />
  </AdminLayout>;
};
